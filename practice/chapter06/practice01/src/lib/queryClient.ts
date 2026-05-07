class QueryClient {
  private cache: Map<string, { data: unknown; updatedAt: number }>;
  private gcTimers: Map<string, ReturnType<typeof setTimeout>>;
  private listeners: Map<string, Set<() => void>>; // value: Set<함수들> <- 이 쿼리를 쓰는 컴포넌트들의 refetch 함수

  constructor() {
    this.cache = new Map(); // 캐시 저장소
    this.gcTimers = new Map();
    this.listeners = new Map(); // 구독자 목록
  }

  // queryKey를 받아서 문자열 키로 변환
  #getKey(queryKey: unknown[]): string {
    return JSON.stringify(queryKey);
  }

  // 캐시에서 데이터를 꺼내기
  getQueryData(queryKey: unknown[]): unknown {
    const key = this.#getKey(queryKey);
    return this.cache.get(key)?.data;
  }

  // 캐시에 데이터 저장하기 {데이터, updatedAt 타임스탬프}
  setQueryData(queryKey: unknown[], data: unknown): void {
    const key = this.#getKey(queryKey);
    this.cache.set(key, { data, updatedAt: Date.now() });
  }

  // 해당 키의 캐시가 존재하는지 확인
  hasQuery(queryKey: unknown[]): boolean {
    const key = this.#getKey(queryKey);
    return this.cache.has(key);
  }

  isStale(queryKey, staleTime) {
    const key = this.#getKey(queryKey);
    const entry = this.cache.get(key);
    if (!entry) return true; // 캐시가 없다면 stale
    return Date.now() - entry.updatedAt > staleTime;
  }

  // gcTime 후 캐시 삭제 예약
  scheduleGC(queryKey, gcTime) {
    const key = this.#getKey(queryKey);

    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.gcTimers.delete(key);
    }, gcTime);
    this.gcTimers.set(key, timer);
  }

  // 예약된 GC 취소하기
  cancelGC(queryKey) {
    const key = this.#getKey(queryKey);
    const timer = this.gcTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.gcTimers.delete(key);
    }
  }

  // 리스너 등록
  subscribe(queryKey, callback) {
    const key = this.#getKey(queryKey);
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
  }

  // 리스너 해제
  unsubscribe(queryKey, callback) {
    const key = this.#getKey(queryKey);
    this.listeners.get(key)?.delete(callback);
  }

  // 캐시 무효화 + 신호 발송하기
  invalidateQueries(queryKey) {
    const key = this.#getKey(queryKey);

    // 캐시를 stale하게 만들기
    const entry = this.cache.get(key);
    if (entry) this.cache.set(key, { ...entry, updatedAt: 0 });

    // 모든 리스너에게 신호 보내기
    this.listeners.get(key)?.forEach((callback) => callback());
  }
}

export const queryClient = new QueryClient();
