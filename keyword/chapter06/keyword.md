# Tanstack Query 입문 1편: useQuery와 useInfiniteQuery로 무한 스크롤과 효율적인 데이터 패칭하기 (1)

## gcTime과 staleTime의 차이점에 대해 정리해보세요 🍠

### `gcTime`은 무엇인가요? 🍠

👉 **쿼리가 "비활성(inactive)" 상태가 된 후 캐시에서 완전히 제거되기까지의 시간(ms)**

"비활성": 해당 queryKey를 구독하는 컴포넌트(observer)가 하나도 없는 상태를 말한다.

예를 들어 해당 쿼리를 사용하던 페이지에서 벗어나면 inactive 상태가 된다.

```
[컴포넌트 언마운트 — inactive 시작]
     ↓
gcTime 동안 → (캐시는 메모리에 살아있음)
     ↓
[gcTime 만료]
     ↓
캐시에서 완전 제거 (Garbage Collection)
```

```tsx
useQuery({
  queryKey: ["todos"],
  queryFn: fetchTodos,
  gcTime: 1000 * 60 * 10, // inactive 후 10분간 캐시 유지
});

// 기본값: 5분 (1000 * 60 * 5)
```

---

### `staleTime`은 무엇인가요? 🍠

👉 **데이터가 "신선(fresh)" 상태로 유지되는 시간(ms)**

staleTime이 지나지 않은 데이터는 **아무리 refetch 트리거가 발생해도 네트워크 요청을 하지 않는다.**

staleTime이 지나면 데이터는 "stale(오래됨)" 상태가 되고, 다음 refetch 트리거 시 백그라운드에서 다시 fetch한다.

```
[fetch 완료]
     ↓
staleTime 동안 → (데이터 fresh, refetch 안 함)
     ↓
[staleTime 만료]
     ↓
stale 상태 — 탭 포커스, 마운트, 재연결 등 트리거 발생 시 refetch
```

```tsx
useQuery({
  queryKey: ["todos"],
  queryFn: fetchTodos,
  staleTime: 1000 * 60 * 5, // 5분 동안은 캐시 데이터를 그대로 사용
});

// 기본값: 0 (fetch 직후 바로 stale)
// Infinity: 절대 stale이 되지 않음 (수동 invalidation 전까지)
```

|                         | staleTime                           | gcTime                                |
| ----------------------- | ----------------------------------- | ------------------------------------- |
| **역할**                | 데이터의 신선도 유지 시간           | 캐시 메모리 보관 시간                 |
| **기준**                | 마지막 fetch 완료 시점              | 마지막 구독자(컴포넌트) 언마운트 시점 |
| **만료 시**             | stale 상태 → 다음 트리거 시 refetch | 캐시 완전 삭제                        |
| **활성 구독자 있을 때** | 관계 없음                           | gcTime 타이머 시작 안 함              |
| **기본값**              | `0`                                 | `5분`                                 |

---

### 두 값을 어떤 식으로 설정하여야 `캐싱 전략에 유리`한가요? 🍠

#### 핵심 원칙: `staleTime ≤ gcTime`

staleTime이 gcTime보다 크면 의미가 없다.

> 캐시 자체가 이미 삭제됐는데 fresh 판정을 할 수 없기 때문!

```tsx
// 올바른 관계
staleTime: 1000 * 60 * 5,   // 5분 — 이 시간 동안 네트워크 요청 안 함
gcTime:    1000 * 60 * 10,  // 10분 — 페이지 이탈 후 10분간 캐시 유지

// 의미 없는 설정
staleTime: 1000 * 60 * 10,  // 10분 fresh
gcTime:    1000 * 60 * 5,   // 5분 후 캐시 삭제 → 10분 fresh가 의미없음
```

#### 데이터 특성별 권장 설정

- 자주 바뀌지 않는 데이터 (카테고리, 설정, 코드 목록 등)
  ```tsx
  // 예: 상품 카테고리, 국가 코드, 앱 설정
  const categoryQueryOptions = queryOptions({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 60, // 1시간 — 거의 안 바뀌므로 오래 fresh 유지
    gcTime: 1000 * 60 * 60 * 24, // 24시간 — 오래 캐시 보관
  });
  ```
- 보통 수준으로 바뀌는 데이터 (게시글 목록, 사용자 프로필 등)
  ```tsx
  // 예: 블로그 포스트 목록, 사용자 정보
  const postsQueryOptions = queryOptions({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
  });
  ```
- 실시간성이 중요한 데이터 (채팅, 재고, 실시간 점수 등)
  ```tsx
  // 예: 실시간 재고, 라이브 스코어
  const liveDataQuery = queryOptions({
    queryKey: ["liveScore"],
    queryFn: fetchLiveScore,
    staleTime: 0, // 항상 stale — 매번 새로 가져옴
    gcTime: 1000 * 30, // 30초만 캐시 유지
    refetchInterval: 5000, // 5초마다 폴링
  });
  ```
- 로그인한 사용자 정보 (전역에서 자주 참조)
  ```tsx
  // 한 번 로그인하면 자주 바뀌지 않으므로 staleTime을 길게
  const meQueryOptions = queryOptions({
    queryKey: ["me"],
    queryFn: fetchCurrentUser,
    staleTime: 1000 * 60 * 30, // 30분
    gcTime: 1000 * 60 * 60, // 1시간
  });
  ```

#### 전역 기본값 설정하기 (QueryClient)

개별 쿼리마다 설정하는 대신, `QueryClient`에 기본값을 지정할 수 있다.

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 기본 1분
      gcTime: 1000 * 60 * 5, // 기본 5분
      retry: 1, // 실패 시 1번만 재시도
      refetchOnWindowFocus: false, // 탭 포커스 시 자동 refetch 끄기
    },
  },
});
```
