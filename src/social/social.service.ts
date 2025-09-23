import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { CreateSocialDto } from './dto/create-social.dto';
import { UpdateSocialDto } from './dto/update-social.dto';
import { UserService } from '../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Block } from '../entities/Blocks';
import { Repository } from 'typeorm';
import { Friendship } from '../entities/Friendships';
import { FriendRequest } from '../entities/FriendRequests';
import { DataSource } from 'typeorm';

@Injectable()
export class SocialService {
  constructor(private _userService: UserService,
    private dataSource: DataSource,
    @InjectRepository(Block) private _blockRepository: Repository<Block>,
    @InjectRepository(Friendship) private _friendshipRepository: Repository<Friendship>,
    @InjectRepository(FriendRequest) private _friendRequestRepository: Repository<FriendRequest>
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
      await queryRunner.manager.save(await this._friendRequestRepository.create({
        fromUserId: createSocialDto.fromUserId,
        toUserId: createSocialDto.toUserId,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7)
      }));

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
    finally {
      await queryRunner.release();
    }
  }
}