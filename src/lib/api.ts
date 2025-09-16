const API_BASE_URL = 'https://shooq-web-back-end.onrender.com/api';
//const API_BASE_URL = 'https://localhost:7183/api';

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
  posted_dt?: Date
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
  activeSites: number;
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
  reg_date: string;
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

export class ApiService {
  private static async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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

  static async getPosts(
    page: number = 1,
    pageSize: number = 10,
    site?: string,
    sites?: string[],
    sortBy: string = '',
    keyword?: string,
    author?: string,
    isNewsYn: 'y' | 'n' = 'n'
  ): Promise<PagedResult<SiteBbsInfo>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      sortBy: sortBy,
      isNewsYn: isNewsYn,
    });
    
    if (site) {
      params.append('site', site);
    } else if (sites && sites.length > 0) {
      // 다중 사이트 필터링
      sites.forEach(s => params.append('sites', s));
    }

    if (keyword) params.append('keyword', keyword);
    if (author) params.append('author', author);

    return this.fetchApi<PagedResult<SiteBbsInfo>>(`/posts?${params.toString()}`);
  }

  static async getPost(no: number): Promise<SiteBbsInfo> {
    return this.fetchApi<SiteBbsInfo>(`/${no}`);
  }

  static async getSites(): Promise<string[]> {
    return this.fetchApi<string[]>('/sites');
  }


  static async getPopularPosts(count: number = 10): Promise<SiteBbsInfo[]> {
    return this.fetchApi<SiteBbsInfo[]>(`/popular?count=${count}`);
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
}