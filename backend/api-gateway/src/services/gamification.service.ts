import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);
  private readonly gamificationServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    // Note: gamification service is not in the configuration yet, using port 3010
    this.gamificationServiceUrl = 'http://gamification-service:3010';
  }

  // Points Management
  async getUserPoints(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.gamificationServiceUrl}/api/points/user/${userId}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get user points failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get user points error: ${error.message}`);
      throw error;
    }
  }

  async awardPoints(awardPointsDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.gamificationServiceUrl}/api/points/award`, awardPointsDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Award points failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Award points error: ${error.message}`);
      throw error;
    }
  }

  async getPointsLeaderboard(filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.gamificationServiceUrl}/api/points/leaderboard?${queryString}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get points leaderboard failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get points leaderboard error: ${error.message}`);
      throw error;
    }
  }

  // Badges Management
  async getUserBadges(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.gamificationServiceUrl}/api/badges/user/${userId}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get user badges failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get user badges error: ${error.message}`);
      throw error;
    }
  }

  async getAvailableBadges() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.gamificationServiceUrl}/api/badges/available`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get available badges failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get available badges error: ${error.message}`);
      throw error;
    }
  }

  async awardBadge(awardBadgeDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.gamificationServiceUrl}/api/badges/award`, awardBadgeDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Award badge failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Award badge error: ${error.message}`);
      throw error;
    }
  }

  async createBadge(createBadgeDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.gamificationServiceUrl}/api/badges`, createBadgeDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Create badge failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Create badge error: ${error.message}`);
      throw error;
    }
  }

  async updateBadge(badgeId: string, updateBadgeDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.gamificationServiceUrl}/api/badges/${badgeId}`, updateBadgeDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update badge failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update badge error: ${error.message}`);
      throw error;
    }
  }

  // Achievements Management
  async getUserAchievements(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.gamificationServiceUrl}/api/achievements/user/${userId}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get user achievements failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get user achievements error: ${error.message}`);
      throw error;
    }
  }

  async getAvailableAchievements() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.gamificationServiceUrl}/api/achievements/available`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get available achievements failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get available achievements error: ${error.message}`);
      throw error;
    }
  }

  async createAchievement(createAchievementDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.gamificationServiceUrl}/api/achievements`, createAchievementDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Create achievement failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Create achievement error: ${error.message}`);
      throw error;
    }
  }

  // Streaks Management
  async getUserStreaks(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.gamificationServiceUrl}/api/streaks/user/${userId}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get user streaks failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get user streaks error: ${error.message}`);
      throw error;
    }
  }

  async updateStreak(userId: string, updateStreakDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.gamificationServiceUrl}/api/streaks/user/${userId}`, updateStreakDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Update streak failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Update streak error: ${error.message}`);
      throw error;
    }
  }

  // Levels Management
  async getUserLevel(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.gamificationServiceUrl}/api/levels/user/${userId}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get user level failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get user level error: ${error.message}`);
      throw error;
    }
  }

  async getLevelSystem() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.gamificationServiceUrl}/api/levels/system`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get level system failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get level system error: ${error.message}`);
      throw error;
    }
  }

  // Challenges Management
  async getUserChallenges(userId: string, filters: any) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await firstValueFrom(
        this.httpService.get(`${this.gamificationServiceUrl}/api/challenges/user/${userId}?${queryString}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get user challenges failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get user challenges error: ${error.message}`);
      throw error;
    }
  }

  async joinChallenge(challengeId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.gamificationServiceUrl}/api/challenges/${challengeId}/join`, { userId }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Join challenge failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Join challenge error: ${error.message}`);
      throw error;
    }
  }

  async completeChallenge(challengeId: string, userId: string, completionDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.gamificationServiceUrl}/api/challenges/${challengeId}/complete`, 
          { userId, ...completionDto }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Complete challenge failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Complete challenge error: ${error.message}`);
      throw error;
    }
  }

  async createChallenge(createChallengeDto: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.gamificationServiceUrl}/api/challenges`, createChallengeDto).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Create challenge failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Create challenge error: ${error.message}`);
      throw error;
    }
  }

  // Rewards Management
  async getUserRewards(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.gamificationServiceUrl}/api/rewards/user/${userId}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get user rewards failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get user rewards error: ${error.message}`);
      throw error;
    }
  }

  async claimReward(rewardId: string, userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.gamificationServiceUrl}/api/rewards/${rewardId}/claim`, { userId }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Claim reward failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Claim reward error: ${error.message}`);
      throw error;
    }
  }

  // Statistics
  async getGamificationStats(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.gamificationServiceUrl}/api/stats/user/${userId}`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get gamification stats failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get gamification stats error: ${error.message}`);
      throw error;
    }
  }

  async getGlobalGamificationStats() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.gamificationServiceUrl}/api/stats/global`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Get global gamification stats failed: ${error.message}`);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Get global gamification stats error: ${error.message}`);
      throw error;
    }
  }
} 