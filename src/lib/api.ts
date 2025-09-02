const API_BASE_URL = 'https://shooq-web-back-end.onrender.com/api';

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
  regDate?: string;
  replyNum?: string;
  content?: string;
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

export class ApiService {
  private static async fetchApi<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  static async getPosts(page: number = 1, pageSize: number = 10, site?: string, sites?: string[]): Promise<PagedResult<SiteBbsInfo>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    
    if (site) {
      params.append('site', site);
    } else if (sites && sites.length > 0) {
      // 다중 사이트 필터링
      sites.forEach(s => params.append('sites', s));
    }

    return this.fetchApi<PagedResult<SiteBbsInfo>>(`/posts?${params.toString()}`);
  }

  static async getPost(no: number): Promise<SiteBbsInfo> {
    return this.fetchApi<SiteBbsInfo>(`/${no}`);
  }

  static async getSites(): Promise<string[]> {
    return this.fetchApi<string[]>('/sites');
  }

  static async searchPosts(
    keyword?: string,
    site?: string,
    author?: string,
    page: number = 1,
    pageSize: number = 10,
    sites?: string[]
  ): Promise<PagedResult<SiteBbsInfo>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (keyword) params.append('keyword', keyword);
    if (site) {
      params.append('site', site);
    } else if (sites && sites.length > 0) {
      // 다중 사이트 필터링
      sites.forEach(s => params.append('sites', s));
    }
    if (author) params.append('author', author);

    return this.fetchApi<PagedResult<SiteBbsInfo>>(`/search?${params.toString()}`);
  }

  static async getPopularPosts(count: number = 10): Promise<SiteBbsInfo[]> {
    return this.fetchApi<SiteBbsInfo[]>(`/popular?count=${count}`);
  }
}