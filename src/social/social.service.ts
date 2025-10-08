import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateSocialDto } from './dto/create-social.dto';
import { UserService } from '../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Block } from '../entities/Blocks';
import { Repository } from 'typeorm';
import { Friendship } from '../entities/Friendships';
import { FriendRequest } from '../entities/FriendRequests';
import { DataSource } from 'typeorm';
import { RealtimeService } from '../realtime/realtime.service';

@Injectable()
export class SocialService {
  constructor(private _userService: UserService,
    private dataSource: DataSource,
    @InjectRepository(Block) private _blockRepository: Repository<Block>,
    @InjectRepository(Friendship) private _friendshipRepository: Repository<Friendship>,
    @InjectRepository(FriendRequest) private _friendRequestRepository: Repository<FriendRequest>,
    private _realtimeService: RealtimeService,
  ) {

  }
  async create(createSocialDto: CreateSocialDto) {
    // first check if the from and to userid should not be same 
    this.checkSimilarUserId(createSocialDto);
    // Check if both userids exist in table or not 
    await this.userExists(createSocialDto);
    // Check if its blocked or not
    await this.isBlocked(createSocialDto.fromUserId, createSocialDto.toUserId);
    // check if they are friends or not
    await this.areFriends(createSocialDto.fromUserId, createSocialDto.toUserId);
    // Check if request is pending or not 
    await this.friendRequestPending(createSocialDto.fromUserId, createSocialDto.toUserId);
    // Now insert into friends_request
    await this.sendFriendRequest(createSocialDto);
  }
  private checkSimilarUserId(createSocialDto: CreateSocialDto) {
    if (createSocialDto.fromUserId === createSocialDto.toUserId) {
      throw new BadRequestException('The from userid and to userid cannot be same');
    }
  }

  private async userExists(createSocialDto: CreateSocialDto) {
    const fromUserIdExists = await this._userService.findById(createSocialDto.fromUserId);
    const toUserId = await this._userService.findById(createSocialDto.toUserId);
    if (!fromUserIdExists || !toUserId) {
      throw new BadRequestException('from userid or to userId does not exists');
    }
  }

  async isBlocked(fromUserId: string, toUserId: string) {
    const block = await this._blockRepository.findOne({ where: { blockerId: fromUserId, blockedId: toUserId } });
    if (block) {
      throw new ForbiddenException('You cannot perform this action due to a block.');
    }
  }

  async areFriends(fromUserId: string, toUserid: string) {
    // Check friendships table if the friend exists or not 
    const user_a_id = Math.min(parseInt(fromUserId), parseInt(toUserid));
    const user_b_id = Math.max(parseInt(fromUserId), parseInt(toUserid));
    // check if the friendship exists in this or not 
    const isFriend = await this._friendshipRepository.find({ where: { userAId: user_a_id.toString(), userBId: user_b_id.toString() } });
    if (isFriend !== null && isFriend.length > 0) {
      throw new ConflictException('Already friends'); // Please change the message afterwords
    }
  }

  async friendRequestPending(fromUserId: string, toUserId: string) {
    const result = await this._friendRequestRepository.find({ where: { fromUserId: fromUserId.toString(), toUserId: toUserId.toString(), status: 'pending' } });
    if (result !== null && result.length > 0) {
      throw new ConflictException('A pending request already exists.');
    }
  }

  async sendFriendRequest(createSocialDto: CreateSocialDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // please add all the checks before inserting into friend_request
      this.checkSimilarUserId(createSocialDto);
      // Check if both userids exist in table or not 
      await this.userExists(createSocialDto);
      // Check if its blocked or not
      await this.isBlocked(createSocialDto.fromUserId, createSocialDto.toUserId);
      // check if they are friends or not
      await this.areFriends(createSocialDto.fromUserId, createSocialDto.toUserId);
      // Check if request is pending or not 
      await this.friendRequestPending(createSocialDto.fromUserId, createSocialDto.toUserId);
      const friendRequest = this._friendRequestRepository.create({
        fromUserId: createSocialDto.fromUserId,
        toUserId: createSocialDto.toUserId,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in ms
      });

      const result = await queryRunner.manager.save(friendRequest);
      if (!result) {
        throw new Error('Friend request could not be saved');
      }
      // send and emit notification here
      const notification = {
        userId: createSocialDto.toUserId,
        type: 'friend_request' as const,
        referenceId: result.id,
        payload: {
          toUserId: createSocialDto.toUserId,
          fromUserId: createSocialDto.fromUserId,
        }
      }
      console.log('notification', notification);
      const notify = await this._realtimeService.createAndEmitFriendNotification(notification);
      if (!notify) {  
        throw new Error('Failed to create and emit friend request notification');
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
    finally {
      await queryRunner.release();
    }
  }
  async cancelRequest(actorId: string, requestId: string) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      // 1) Lock & fetch the friend_request row FOR UPDATE
      const reqRow = await qr.manager
        .createQueryBuilder('friend_requests', 'fr')
        .setLock('pessimistic_write')
        .where('fr.id = :id', { id: requestId })
        .andWhere('fr.status = :status', { status: 'pending' })
        .getRawOne();
      if (!reqRow) {
        await qr.rollbackTransaction();
        throw new NotFoundException('Friend request not found');
      }
      // 2) Ownership check
      if (Number(reqRow.fr_from_user_id) !== Number(actorId)) {
        await qr.rollbackTransaction();
        throw new ForbiddenException('Only sender can cancel the request');
      }
      // 3) State check
      if (reqRow.fr_status !== 'pending') {
        await qr.rollbackTransaction();
        throw new ConflictException('Cannot cancel non-pending request');
      }
      // 4) Update row to cancelled
      await qr.manager.getRepository(FriendRequest).update(
        {
          id: requestId
        },
        {
          status: 'cancelled',
          respondedAt: () => 'CURRENT_TIMESTAMP', // raw SQL expression
        }
      );
      await qr.commitTransaction();
      return { success: true, requestId, status: 'cancelled' };
    } catch (err) {
      console.log(err);
      try { await qr.rollbackTransaction(); } catch (_) { }
      if (err instanceof NotFoundException || err instanceof ForbiddenException || err instanceof ConflictException) {
        throw err;
      }
      // unexpected DB error
      throw new InternalServerErrorException('Failed to cancel request');
    } finally {
      await qr.release();
    }
  }

  async acceptRequest(actorId: string, requestId: string) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const friendRequest = await this._friendRequestRepository.findOne({ where: { id: requestId, status: 'pending' } });
      if (friendRequest === null) {
        // Either ID is null or undefined, handle accordingly
        await qr.rollbackTransaction(); // or throw an error, or skip, etc.
        throw new NotFoundException('No friend requests exists');
      }
      if (friendRequest !== null) {
        const isBlocked = await this._blockRepository.findOne({
          where: {
            blockerId: friendRequest.fromUserId!,
            blockedId: friendRequest.toUserId!
          }
        });
        if (isBlocked) {
          await qr.rollbackTransaction();
          throw new ForbiddenException('Only sender can cancel the request');
        }
        await this.areFriends(actorId, friendRequest.toUserId!);
        const user_a_id = Math.min(parseInt(actorId), parseInt(friendRequest.toUserId!));
        const user_b_id = Math.max(parseInt(actorId), parseInt(friendRequest.toUserId!))
        const addFriends = this._friendshipRepository.create({ // change variable name afterwards 
          userAId: user_a_id.toString(),
          userBId: user_b_id.toString(),
          createdAt: new Date()
        });
        await qr.manager.save(addFriends);
        // update status in friend_request as accepted
        await qr.manager.getRepository(FriendRequest).update(
          {
            id: requestId
          },
          {
            status: 'accepted',
            respondedAt: () => 'CURRENT_TIMESTAMP',
          }
        );
        await qr.commitTransaction();
      }

    } catch (err) {
      console.log(err);
      try { await qr.rollbackTransaction(); } catch (_) { }
      if (err instanceof NotFoundException || err instanceof ForbiddenException || err instanceof ConflictException) {
        throw err;
      }
      // unexpected DB error
      throw new InternalServerErrorException('Failed to cancel request');
    } finally {
      await qr.release();
    }
  }

  async declineRequest(actorId: string, requestId: string) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      // 1) Lock & fetch the friend_request row FOR UPDATE
      const reqRow = await qr.manager
        .createQueryBuilder('friend_requests', 'fr')
        .setLock('pessimistic_write')
        .where('fr.id = :id', { id: requestId })
        .andWhere('fr.status = :status', { status: 'pending' })
        .getRawOne();
      if (!reqRow) {
        await qr.rollbackTransaction();
        throw new NotFoundException('Friend request not found');
      }
      // 2) Ownership check
      if (Number(reqRow.fr_from_user_id) !== Number(actorId)) {
        await qr.rollbackTransaction();
        throw new ForbiddenException('Only sender can cancel the request');
      }
      // 3) State check
      if (reqRow.fr_status !== 'pending') {
        await qr.rollbackTransaction();
        throw new ConflictException('Cannot cancel non-pending request');
      }
      // 4) Update row to cancelled
      await qr.manager.getRepository(FriendRequest).update(
        {
          id: requestId
        },
        {
          status: 'decline',
          respondedAt: () => 'CURRENT_TIMESTAMP', // raw SQL expression
        }
      );
      await qr.commitTransaction();
      return { success: true, requestId, status: 'decline' };
    } catch (err) {
      console.log(err);
      try { await qr.rollbackTransaction(); } catch (_) { }
      if (err instanceof NotFoundException || err instanceof ForbiddenException || err instanceof ConflictException) {
        throw err;
      }
      // unexpected DB error
      throw new InternalServerErrorException('Failed to cancel request');
    } finally {
      await qr.release();
    }
  }

  async getIncomingRequests(actorId: string) {
    // query data from 
    const result = await this.dataSource
      .getRepository(FriendRequest)
      .createQueryBuilder('fr')
      .leftJoin('fr.fromUser', 'fromUser')
      .select([
        'fr.id AS requestId',
        'fr.status AS status',
        'fr.createdAt AS createdAt',
        'fromUser.id AS fromUserId',
        'fromUser.username AS fromUsername'
      ])
      .where('fr.toUserId = :actorId', { actorId })
      .andWhere('fr.status = :status', { status: 'pending' })
      .getRawMany();
    return result;
  }

  async getOutgoingRequests(actorId: string) {
    const rows = await this.dataSource
      .getRepository(FriendRequest)
      .createQueryBuilder('fr')
      .innerJoin('fr.toUser', 'toUser')
      .select([
        'fr.id AS requestId',
        'fr.status AS status',
        'fr.createdAt AS createdAt',
        'toUser.id AS toUserId',
        'toUser.username AS toUserName',
      ])
      .where('fr.fromUserId = :actorId', { actorId })
      .andWhere('fr.status = :status', { status: 'pending' })
      .orderBy('fr.createdAt', 'DESC')
      .getRawMany();

    return rows;
  }
}