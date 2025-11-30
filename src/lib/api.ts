//const API_BASE_URL = 'https://shooq-web-back-end.onrender.com/api';
//const API_BASE_URL = 'https://localhost:7171/api';
//const API_BASE_URL = 'https://semioviparous-braden-nontransferential.ngrok-free.dev/api';
const API_BASE_URL = 'https://api.shooq.live/api';

export interface OptimizedImages {
  id: number;
  cloudinary_url?: string;
  no?: number;
  media_type?: 'image' | 'video'; // 미디어 타입 구분 (기본값: image)
}

export interface SiteBbsInfo {
  no: number;
  number?: number;
  title?: string;
  author?: string;
  date?: string;
  views?: number;
  likes?: number;
  url?: string;
  site?: string;
  reg_date?: string;
  reply_num?: string;
  content?: string;
  posted_dt?: Date;
  gubun?: string;
  cloudinary_url?: string;
  optimizedImagesList?: OptimizedImages[];
}

export interface SiteBbsInfoMain {
  no: number;
  number?: number;
  title?: string;
  author?: string;
  date?: string;
  views?: number;
  likes?: number;
  url?: string;
  site?: string;
  reg_date?: string;
  reply_num?: string;
  content?: string;
  posted_dt?: Date;
  time_bucket?: string;
  score?: number;
  cloudinary_url?: string;
  optimizedImagesList?: OptimizedImages[];
}

export interface MainPagedResult<T> {
  data: T[];
}

export interface PagedResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdminStats {
  totalPosts: number;
  communityPosts: number;
  newsPosts: number;
  activeSites: number;
  communitySites: number;
  newsSites: number;
  totalVisitors: number;
  todayVisitors: number;
  dailyViews: number;
  systemStatus: string;
}

export interface SiteStats {
  site: string;
  postCount: number;
  todayCount: number;
  lastPostDate: string;
}

export interface RecentPost {
  no: number;
  title: string;
  date: string;
  regDate: string;
  site: string;
}

export interface DailyCrawlStats {
  date: string;
  count: number;
}

export interface DailySiteStats {
  site: string;
  count: number;
}

export interface TrendingCommunity {
  site: string;
  best_post_no: number;
  best_post_title?: string;
  best_post_likes?: number;
  best_post_replies?: number;
  best_post_date?: string;
  best_post_url?: string;
  best_post_author?: string;
  best_post_original_date?: string;
  best_post_views?: number;
  best_post_content?: string;
  total_likes?: number;
  total_replies?: number;
  optimizedImagesList?: OptimizedImages[];
}

export class ApiService {
  private static async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
 
    return response.json();
  }

  static async getMainPosts(
    keyword?: string,
    author?: string,
    isNewsYn: 'y' | 'n' = 'n'
  ): Promise<MainPagedResult<SiteBbsInfoMain>> {
    const params = new URLSearchParams({
      isNewsYn: isNewsYn
    });

    if (keyword) params.append('keyword', keyword);
    if (author) params.append('author', author);

    return this.fetchApi<MainPagedResult<SiteBbsInfoMain>>(`/posts-main?${params.toString()}`);
  }

  static async getNews(
    page: number = 1,
    pageSize: number = 10,
    keyword?: string,
    author?: string
  ): Promise<MainPagedResult<SiteBbsInfoMain>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (keyword) params.append('keyword', keyword);
    if (author) params.append('author', author);

    return this.fetchApi<MainPagedResult<SiteBbsInfoMain>>(`/news?${params.toString()}`);
  }

  static async getPosts(
    page: number = 1,
    pageSize: number = 10,
    site?: string,
    keyword?: string,
    author?: string,
    maxNo?: number,
    sortBy?: string,
    topPeriod?: string
  ): Promise<PagedResult<SiteBbsInfo>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    });

    if (site) {
      params.append('site', site);
    }

    if (keyword) params.append('keyword', keyword);
    if (author) params.append('author', author);
    if (maxNo) params.append('maxNo', maxNo.toString());
    if (sortBy) params.append('sortBy', sortBy);
    if (topPeriod) params.append('topPeriod', topPeriod);

    return this.fetchApi<PagedResult<SiteBbsInfo>>(`/posts?${params.toString()}`);
  }

    static async getPopularPosts(page: number = 1, pageSize: number = 10, maxNo?: number, site?: string, keyword?: string): Promise<PagedResult<SiteBbsInfo>> {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString()
        });

        if (maxNo) params.append('maxNo', maxNo.toString());
        if (site) params.append('site', site);
        if (keyword) params.append('keyword', keyword);

        return this.fetchApi<PagedResult<SiteBbsInfo>>(`/posts-popular?${params.toString()}`);
    }

  static async getPost(no: number): Promise<SiteBbsInfo> {
    const post = await this.fetchApi<SiteBbsInfo>(`/posts/${no}`);

    // Humoruniv 사이트의 경우 불필요한 스타일 태그 제거
    if (post.site === 'Humoruniv' && post.content) {
      post.content = post.content.replace(
        /<p>\s*\.body_editor\{[^}]+\}[\s\S]*?<\/p>/gi,
        ''
      );
    }

    return post;
  }

 static async getWeek(
    yyyy?: string,
    mm?: string,
    w?: string,
    d?: string
  ): Promise<PagedResult<SiteBbsInfo>> {
    const params = new URLSearchParams();
    if (yyyy) params.append('yyyy', yyyy);
    if (mm) params.append('mm', mm);
    if (w) params.append('w', w);
    if (d) params.append('d', d);

    return this.fetchApi<PagedResult<SiteBbsInfo>>(`/week?${params.toString()}`);
  }

  static async getSites(): Promise<string[]> {
    return this.fetchApi<string[]>('/sites');
  }

  // 접속 로그 기록
  static async logAccess(): Promise<{ message: string }> {
    try {
      return this.fetchApi<{ message: string }>('/accesslog/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      // 접속 로그 실패는 사용자 경험에 영향을 주지 않도록 조용히 처리
      console.warn('Failed to log access:', error);
      return { message: 'Failed to log access' };
    }
  }

  // 관리자 통계 조회
  static async getAdminStats(): Promise<AdminStats> {
    return this.fetchApi<AdminStats>('/admin/stats');
  }

  // 사이트별 통계 조회
  static async getSiteStats(): Promise<SiteStats[]> {
    return this.fetchApi<SiteStats[]>('/admin/site-stats');
  }

  // 크롤링 시간 기준 최근 글 조회
  static async getRecentPostsByCrawlTime(count: number = 5): Promise<RecentPost[]> {
    return this.fetchApi<RecentPost[]>(`/admin/recent-posts-by-crawl?count=${count}`);
  }

  // 컨텐츠 시간 기준 최근 글 조회
  static async getRecentPostsByContentTime(count: number = 5): Promise<RecentPost[]> {
    return this.fetchApi<RecentPost[]>(`/admin/recent-posts-by-content?count=${count}`);
  }

  // 일주일간 일별 크롤링 통계 조회
  static async getWeeklyCrawlStats(): Promise<DailyCrawlStats[]> {
    return this.fetchApi<DailyCrawlStats[]>('/admin/weekly-crawl-stats');
  }

  // 오늘 사이트별 크롤링 통계 조회
  static async getDailySiteStats(): Promise<DailySiteStats[]> {
    return this.fetchApi<DailySiteStats[]>('/admin/daily-site-stats');
  }

  // 오늘 최신 크롤링 시간 조회
  static async getLatestCrawlTime(): Promise<{ latestCrawlTime: string | null }> {
    return this.fetchApi<{ latestCrawlTime: string | null }>('/admin/latest-crawl-time');
  }

  // 트렌딩 커뮤니티 조회 (레딧 스타일)
  static async getTrendingCommunities(limit: number = 6): Promise<TrendingCommunity[]> {
    return this.fetchApi<TrendingCommunity[]>(`/trending-communities?limit=${limit}`);
  }
}