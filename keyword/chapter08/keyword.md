# Tanstack Query 입문 2편: useMutation과 Optimistic Update

## Debounce 구글링 후 개념 정리 및 코드 작성해보기 🍠

### Debounce 개념 정리 🍠

### 개념

> **마지막 호출 이후 N ms가 지나야 함수가 실행된다.**

이벤트가 연속으로 발생할 때, **"조용해진 뒤"에만 반응**하는 기법이다.

타이머가 실행 중인데 또 호출되면? → 타이머를 리셋한다.

마지막 호출로부터 지정한 시간이 지나야 비로소 함수가 실행된다.

```
[연속 이벤트 발생]
  ↓ ↓ ↓ ↓ ↓      ← 타이머 계속 초기화
              ──── delay ────▶ 함수 실행 (딱 한 번)
```

---

### 구현 (vanilla JS)

```jsx
function debounce(func, duration) {
  let timeout;

  return function (...args) {
    const effect = () => {
      timeout = null;
      return func.apply(this, args);
    };

    clearTimeout(timeout); // 이전 타이머 취소
    timeout = setTimeout(effect, duration); // 새 타이머 등록
  };
}
```

**동작 흐름**

1. 함수 호출 → `setTimeout` 등록
2. delay 전에 또 호출되면 → `clearTimeout`으로 이전 타이머 취소 후 재등록
3. delay 동안 추가 호출 없으면 → 함수 실행

---

### Leading / Trailing 옵션

기본 debounce는 **trailing** 방식 (마지막 이후 실행)이지만, `leading` 옵션을 켜면 **첫 호출 즉시 실행** 후 이후 호출을 무시할 수 있다.

| 옵션                      | 동작                                           | 사용 예시           |
| ------------------------- | ---------------------------------------------- | ------------------- |
| `trailing: true` (기본값) | 마지막 호출 이후 delay 지나면 실행             | 검색 자동완성       |
| `leading: true`           | 첫 호출 즉시 실행, 이후 호출은 debounce        | 버튼 중복 클릭 방지 |
| `maxWait`                 | 최대 대기 시간 설정 (이 시간 지나면 강제 실행) | 자동 저장           |

```jsx
// lodash 기준
_.debounce(func, 500, { leading: true, trailing: false });
```

---

### Throttle과의 차이

|               | Debounce                                    | Throttle                             |
| ------------- | ------------------------------------------- | ------------------------------------ |
| **실행 시점** | 마지막 호출 후 N ms 뒤                      | N ms마다 최대 1회                    |
| **중간 상태** | 무시                                        | 일정 간격으로 반응                   |
| **비유**      | 과부하된 웨이터 (당신이 말하는 동안 기다림) | 스프링 공 기계 (준비되면 1개만 발사) |
| **사용 목적** | 최종 상태에만 반응                          | 일정한 주기로 반응                   |

---

### 언제 쓸까?

> **"중간 과정은 필요 없고 최종 결과에만 반응하고 싶을 때"**

- **검색 자동완성** — 타이핑 중 매 keystroke마다 API 호출하면 서버 부하 폭발. 타이핑 멈춘 뒤 300~500ms 후 1번만 요청
- **자동 저장** — 편집 중 계속 저장하면 DB trip 낭비. 입력이 멈출 때만 저장
- **window resize 레이아웃 재계산** — 리사이즈 중 매번 계산하면 성능 저하. 리사이즈 끝난 후 계산
- **무한 스크롤 API 호출** — 스크롤 중 매번 요청 방지

---

### React에서 사용할 때

#### ❌ 실수 — render마다 새 인스턴스 생성

```jsx
// 렌더링할 때마다 새 debounce 인스턴스가 생성됨 → 동작 안 함
<button onClick={debounce(handleClick, 500)}>
```

#### ✅ 올바른 방법 1 — 클래스 컴포넌트

```jsx
class MyComponent extends React.Component {
  handleButtonClick = debounce(() => {
    console.log("clicked");
  }, 500); // 선언부에서 한 번만 debounce

  render() {
    return <button onClick={this.handleButtonClick}>Click</button>;
  }
}
```

#### ✅ 올바른 방법 2 — 함수형 컴포넌트 (`useMemo`)

```jsx
const debouncedSearch = useMemo(
  () => debounce((value) => fetchResults(value), 500),
  [], // 마운트 시 한 번만 생성
);
```

#### ✅ 올바른 방법 3 — `useDebounce` 커스텀 훅

```tsx
import { useDebounce } from "use-debounce";

function SearchInput() {
  const [text, setText] = useState("");
  const [debouncedValue] = useDebounce(text, 500);

  useEffect(() => {
    if (debouncedValue) fetchResults(debouncedValue); // 500ms 후 API 호출
  }, [debouncedValue]);

  return <input onChange={(e) => setText(e.target.value)} />;
}
```

---

### 최적 delay 시간

> 케이스마다 테스트해야 한다.

| 상황            | 권장 delay  |
| --------------- | ----------- |
| 타이핑 (검색)   | 300~500ms   |
| resize / scroll | 100~200ms   |
| 자동 저장       | 1000ms 이상 |

너무 짧으면 → 성능 최적화 효과 없음

너무 길면 → UI가 느리게 느껴짐

---

### 주의사항

1. **동일한 함수 참조**를 유지해야 한다 — debounce/throttle은 같은 인스턴스가 계속 호출되어야 동작함
2. 컴포넌트 **언마운트 시 타이머 정리** 필요 → `cancel()` 또는 cleanup 처리
3. `AbortController`와 조합하면 **이전 API 요청 취소**도 가능 (레이스 컨디션 방지)
   <br><br>

<hr>

### Debounce 코드 작성 🍠

### 기본 구현

```jsx
function debounce(func, delay) {
  let timeout;

  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
```

### 사용 예시

```jsx
const handleInput = debounce((value) => {
  console.log("검색어:", value);
}, 500);

document.querySelector("input").addEventListener("input", (e) => {
  handleInput(e.target.value);
});
```

---

### Leading 옵션 추가

> 첫 호출은 즉시 실행하고, 이후 연속 호출은 무시하고 싶을 때

```jsx
function debounce(func, delay, { leading = false } = {}) {
  let timeout;

  return function (...args) {
    // leading이고 타이머가 없으면 즉시 실행
    if (leading && !timeout) {
      func.apply(this, args);
    }

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;

      // trailing 실행 (leading만 true면 여기선 실행 안 함)
      if (!leading) {
        func.apply(this, args);
      }
    }, delay);
  };
}
```

#### 사용 예시

```jsx
// 버튼 첫 클릭만 즉시 처리, 연속 클릭 무시
const handleSubmit = debounce(
  () => {
    console.log("제출!");
  },
  1000,
  { leading: true },
);

button.addEventListener("click", handleSubmit);
```

---

### Leading + Trailing 옵션 모두 지원

```jsx
function debounce(func, delay, { leading = false, trailing = true } = {}) {
  let timeout;
  let isLeadingCalled = false;

  return function (...args) {
    if (leading && !timeout) {
      func.apply(this, args);
      isLeadingCalled = true;
    } else {
      isLeadingCalled = false;
    }

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (trailing && !isLeadingCalled) {
        func.apply(this, args);
      }
      timeout = null;
    }, delay);
  };
}
```

| 설정                                 | 동작                                 |
| ------------------------------------ | ------------------------------------ |
| `{ leading: false, trailing: true }` | 기본값. 마지막 호출 후 delay 뒤 실행 |
| `{ leading: true, trailing: false }` | 첫 호출 즉시 실행, 이후 무시         |
| `{ leading: true, trailing: true }`  | 첫 호출 즉시 + 마지막 호출 후도 실행 |

---

### cancel / flush 메서드 추가

> lodash처럼 debounce 취소 또는 즉시 실행을 외부에서 제어하고 싶을 때

```jsx
function debounce(func, delay) {
  let timeout;
  let lastArgs;

  function debounced(...args) {
    lastArgs = args;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, lastArgs);
      timeout = null;
    }, delay);
  }

  // 대기 중인 타이머 취소
  debounced.cancel = function () {
    clearTimeout(timeout);
    timeout = null;
  };

  // 즉시 실행 (대기 중이면 바로 실행 후 타이머 제거)
  debounced.flush = function () {
    if (timeout) {
      func.apply(this, lastArgs);
      debounced.cancel();
    }
  };

  // 타이머 대기 중 여부
  debounced.isPending = function () {
    return !!timeout;
  };

  return debounced;
}
```

#### 사용 예시

```jsx
const debouncedSave = debounce(saveData, 1000);

input.addEventListener("input", (e) => {
  debouncedSave(e.target.value);
});

// 페이지 떠나기 전 강제 저장
window.addEventListener("beforeunload", () => {
  debouncedSave.flush();
});

// 취소 버튼
cancelBtn.addEventListener("click", () => {
  debouncedSave.cancel();
});
```

---

### React 커스텀 훅 — `useDebounce`

#### 값(value) debounce

```tsx
import { useState, useEffect } from "react";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer); // 클린업: 타이머 취소
  }, [value, delay]);

  return debouncedValue;
}
```

#### 사용 예시

```tsx
function SearchInput() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery) {
      fetchSearchResults(debouncedQuery); // 500ms 후 API 호출
    }
  }, [debouncedQuery]);

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="검색어 입력..."
    />
  );
}
```

---

### React 커스텀 훅 — `useDebouncedCallback`

#### 함수(callback) debounce

```tsx
import { useCallback, useRef } from "react";

function useDebouncedCallback<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        func(...args);
      }, delay);
    },
    [func, delay],
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { debounced, cancel };
}
```

#### 사용 예시

```tsx
function Form() {
  const { debounced: debouncedSave, cancel } = useDebouncedCallback(
    (value: string) => saveToServer(value),
    1000,
  );

  return (
    <>
      <textarea onChange={(e) => debouncedSave(e.target.value)} />
      <button onClick={cancel}>저장 취소</button>
    </>
  );
}
```

---

### AbortController 조합 — 레이스 컨디션 방지

```tsx
function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const controllerRef = useRef(new AbortController());

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      controllerRef.current = new AbortController(); // 새 controller 발급
    }, delay);

    return () => {
      clearTimeout(timer);
      controllerRef.current.abort(); // 이전 요청 취소
    };
  }, [value, delay]);

  return {
    debouncedValue,
    signal: controllerRef.current.signal, // fetch에 넘겨서 요청 취소
  };
}
```

#### 사용 예시

```tsx
const { debouncedValue, signal } = useDebounce(query, 500);

useEffect(() => {
  if (!debouncedValue) return;

  fetch(`/api/search?q=${debouncedValue}`, { signal })
    .then((res) => res.json())
    .then(setResults)
    .catch((err) => {
      if (err.name === "AbortError") return; // 취소된 요청은 무시
      console.error(err);
    });
}, [debouncedValue]);
```

---

### 정리

| 단계                   | 핵심                                          |
| ---------------------- | --------------------------------------------- |
| 기본 구현              | `clearTimeout` + `setTimeout` 조합            |
| Leading 옵션           | 타이머 없을 때 첫 호출 즉시 실행              |
| cancel / flush         | 외부에서 타이머 제어                          |
| `useDebounce`          | value를 debounce — 검색 입력에 적합           |
| `useDebouncedCallback` | 함수를 debounce — 이벤트 핸들러에 적합        |
| AbortController        | 이전 fetch 요청까지 취소 — 레이스 컨디션 방지 |

---

<br><br>

## Throttling 구글링 후 개념 정리 및 코드 작성해보기 🍠

### Throttling 개념 정리 🍠

### 개념

> **N ms 동안 최대 1번만 함수가 실행된다.**

이벤트가 아무리 연속으로 발생해도, **지정한 시간 간격마다 딱 1번만** 실행되도록 제한하는 기법이다.

중간에 발생하는 나머지 호출은 전부 무시된다.

```
[연속 이벤트 발생]
  ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
  ▶ 실행     ▶ 실행     ▶ 실행
  |←  500ms →|←  500ms →|
```

---

### Debounce와의 차이

|                 | Throttle                           | Debounce                              |
| --------------- | ---------------------------------- | ------------------------------------- |
| **실행 시점**   | N ms마다 최대 1회                  | 마지막 호출 후 N ms 뒤                |
| **중간 이벤트** | 일정 간격으로 반응                 | 전부 무시                             |
| **보장**        | 주기적으로 반드시 실행됨           | 멈춰야만 실행됨                       |
| **비유**        | 스프링 공 기계 (준비되면 1개 발사) | 과부하된 웨이터 (말 끊길 때까지 대기) |
| **사용 목적**   | 일정한 주기로 반응                 | 최종 상태에만 반응                    |

> **핵심 차이:** Throttle은 "주기적으로 반응", Debounce는 "멈춘 뒤에 반응"

---

### 구현 (vanilla JS)

```jsx
function throttle(func, duration) {
  let shouldWait = false;

  return function (...args) {
    if (!shouldWait) {
      func.apply(this, args); // 즉시 실행
      shouldWait = true;

      setTimeout(function () {
        shouldWait = false; // duration 후 다시 실행 가능
      }, duration);
    }
    // shouldWait === true면 그냥 무시
  };
}
```

**동작 흐름:**

1. 첫 호출 → 즉시 실행 + `shouldWait = true`
2. `shouldWait`이 `true`인 동안 → 모든 호출 무시
3. `duration` 경과 → `shouldWait = false`, 다시 실행 가능

---

### Leading / Trailing 옵션

| 옵션                             | 동작                                | 사용 예시                     |
| -------------------------------- | ----------------------------------- | ----------------------------- |
| `leading: true` (기본)           | 구간 시작 시 즉시 실행              | 스크롤 위치 추적, 마우스 이동 |
| `trailing: true`                 | 구간 끝에 마지막 호출도 실행        | UI 최종 상태 반영             |
| `leading: true, trailing: false` | 첫 호출만 실행, 구간 내 마지막 무시 | 게임 입력 처리                |

```jsx
// lodash 기준
_.throttle(func, 500, { leading: true, trailing: false });
```

---

### requestAnimationFrame(rAF) — 특수한 Throttle

> `rAF`는 브라우저의 렌더링 주기(~16ms, 60fps)에 맞춰 실행되는 **내장 throttle**이다.

```jsx
function rafThrottle(func) {
  let rafId = null;

  return function (...args) {
    if (rafId) return; // 이미 예약됨 → 무시

    rafId = requestAnimationFrame(() => {
      func.apply(this, args);
      rafId = null; // 실행 후 초기화
    });
  };
}
```

| 구분          | setTimeout throttle      | rAF throttle                 |
| ------------- | ------------------------ | ---------------------------- |
| 실행 간격     | 지정한 ms                | ~16ms (브라우저 렌더링 주기) |
| 적합한 상황   | API 호출, 비-시각적 작업 | 애니메이션, DOM 위치 계산    |
| 백그라운드 탭 | 계속 실행                | 자동으로 일시 중지           |

**rAF를 써야 할 때:**

- 스크롤에 따른 요소 위치/투명도 변경
- 캔버스 애니메이션
- DOM 속성을 직접 변경하는 모든 작업

---

### 언제 쓸까?

> **"이벤트가 지속되는 동안에도 일정 주기로 반응해야 할 때"**

- **스크롤 이벤트** — 스크롤 중 헤더 스타일 변경, 무한 스크롤 로드 트리거
  → 매 스크롤마다 실행하면 초당 30회 이상 발생, throttle로 제한
- **window resize** — 리사이즈 중 레이아웃 재계산
  → 중간 상태도 반영해야 할 때 (debounce는 끝나야만 실행)
- **mousemove** — 드래그, 커서 위치 추적
- **analytics 이벤트** — 사용자 행동 데이터 전송 빈도 제한
  → 서버 과부하 방지
- **게임 입력** — 키 입력, 버튼 연타 제한

---

### React에서 사용

#### ❌ 실수 — 렌더마다 새 인스턴스 생성

```jsx
// 렌더링마다 새 throttle 인스턴스 생성 → 동작 안 함
<div onScroll={throttle(handleScroll, 500)}>
```

#### ✅ 올바른 방법 1 — `useEffect` 안에서 등록

```jsx
useEffect(() => {
  const throttledScroll = throttle(handleScroll, 500);
  window.addEventListener("scroll", throttledScroll);

  return () => window.removeEventListener("scroll", throttledScroll);
}, []); // 마운트 시 한 번만 등록
```

#### ✅ 올바른 방법 2 — `useMemo`로 인스턴스 고정

```jsx
const throttledScroll = useMemo(
  () => throttle((e) => handleScroll(e), 500),
  [], // 마운트 시 한 번만 생성
);

return <div onScroll={throttledScroll} />;
```

#### ✅ 올바른 방법 3 — `useThrottle` 커스텀 훅

```tsx
import { useThrottle } from "use-throttle"; // 또는 직접 구현

function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0);
  const throttledY = useThrottle(scrollY, 200);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // throttledY는 200ms마다 최대 1번 업데이트
  return <div>스크롤 위치: {throttledY}px</div>;
}
```

---

### 최적 interval 시간

| 상황               | 권장 interval    |
| ------------------ | ---------------- |
| 스크롤 / mousemove | 100~200ms        |
| window resize      | 100~300ms        |
| 게임 입력          | 50~100ms         |
| API 호출 제한      | 500~1000ms       |
| 애니메이션         | rAF 사용 (~16ms) |

---

### 주의사항

1. **동일한 함수 참조** 유지 필수 — 매 렌더마다 새로 만들면 throttle이 리셋됨
2. 컴포넌트 **언마운트 시 이벤트 리스너 제거** 필수 — 메모리 누수 방지
3. `trailing: true` 설정 시 → 마지막 이벤트가 interval 후 한 번 더 실행됨을 인지할 것
4. **rAF throttle**은 백그라운드 탭에서 자동 일시 중지 → 불필요한 연산 절약

---

### Throttle vs Debounce 선택 기준

```
이벤트가 진행되는 동안 중간 상태도 반영해야 한다  →  Throttle
이벤트가 끝난 뒤 최종 결과만 처리하면 된다       →  Debounce

스크롤 중 헤더 변경          →  Throttle
검색창 타이핑 후 API 호출    →  Debounce
마우스 드래그 위치 추적      →  Throttle
폼 자동 저장                →  Debounce
애니메이션 프레임 업데이트   →  rAF Throttle
```

---

<br><br>

### Throttling 코드 작성 🍠

### 기본 구현

```jsx
function throttle(func, duration) {
  let shouldWait = false;

  return function (...args) {
    if (!shouldWait) {
      func.apply(this, args); // 즉시 실행
      shouldWait = true;

      setTimeout(() => {
        shouldWait = false; // duration 후 다시 실행 가능
      }, duration);
    }
  };
}
```

#### 사용 예시

```jsx
const handleScroll = throttle(() => {
  console.log("스크롤 위치:", window.scrollY);
}, 200);

window.addEventListener("scroll", handleScroll);
```

---

### Trailing 옵션 추가

> 구간 내 마지막 호출을 interval 후에 한 번 더 실행하고 싶을 때

```jsx
function throttle(func, duration, { trailing = false } = {}) {
  let shouldWait = false;
  let trailingArgs = null;

  return function (...args) {
    if (!shouldWait) {
      func.apply(this, args);
      shouldWait = true;

      setTimeout(() => {
        shouldWait = false;

        // trailing 옵션이 켜져 있고, 대기 중인 호출이 있으면 실행
        if (trailing && trailingArgs) {
          func.apply(this, trailingArgs);
          trailingArgs = null;
        }
      }, duration);
    } else {
      trailingArgs = args; // 가장 최근 인자 저장
    }
  };
}
```

#### 사용 예시

```jsx
// resize 끝난 뒤 마지막 상태도 반영
const handleResize = throttle(
  () => {
    console.log("window size:", window.innerWidth);
  },
  300,
  { trailing: true },
);

window.addEventListener("resize", handleResize);
```

---

### Leading + Trailing 옵션 모두 지원

```jsx
function throttle(func, duration, { leading = true, trailing = true } = {}) {
  let lastCallTime = 0;
  let timeoutId = null;

  return function (...args) {
    const now = Date.now();
    const remaining = duration - (now - lastCallTime);

    if (remaining <= 0) {
      // duration이 지났으면 즉시 실행 (leading)
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (leading) {
        lastCallTime = now;
        func.apply(this, args);
      }
    } else if (trailing && !timeoutId) {
      // 아직 duration 중 → trailing 예약
      timeoutId = setTimeout(() => {
        lastCallTime = leading ? Date.now() : 0;
        timeoutId = null;
        func.apply(this, args);
      }, remaining);
    }
  };
}
```

| 설정                                 | 동작                                      |
| ------------------------------------ | ----------------------------------------- |
| `{ leading: true, trailing: true }`  | 첫 호출 즉시 실행 + 구간 내 마지막도 실행 |
| `{ leading: true, trailing: false }` | 첫 호출만 실행, 중간 호출 무시            |
| `{ leading: false, trailing: true }` | 구간 끝에만 실행 (debounce에 가까운 동작) |

---

### cancel 메서드 추가

```jsx
function throttle(func, duration) {
  let shouldWait = false;
  let timeoutId = null;

  function throttled(...args) {
    if (!shouldWait) {
      func.apply(this, args);
      shouldWait = true;

      timeoutId = setTimeout(() => {
        shouldWait = false;
        timeoutId = null;
      }, duration);
    }
  }

  // 대기 중인 타이머 취소
  throttled.cancel = function () {
    clearTimeout(timeoutId);
    shouldWait = false;
    timeoutId = null;
  };

  return throttled;
}
```

#### 사용 예시

```jsx
const throttledUpdate = throttle(updatePosition, 200);

window.addEventListener("mousemove", throttledUpdate);

// 드래그 종료 시 throttle 취소
window.addEventListener("mouseup", () => {
  throttledUpdate.cancel();
});
```

---

### requestAnimationFrame(rAF) throttle

> 브라우저 렌더링 주기(~16ms, 60fps)에 맞춰 실행 — DOM 조작, 애니메이션에 적합

```jsx
function rafThrottle(func) {
  let rafId = null;

  const throttled = function (...args) {
    if (rafId) return; // 이미 다음 프레임 예약됨 → 무시

    rafId = requestAnimationFrame(() => {
      func.apply(this, args);
      rafId = null; // 실행 후 초기화
    });
  };

  // 예약된 rAF 취소
  throttled.cancel = function () {
    cancelAnimationFrame(rafId);
    rafId = null;
  };

  return throttled;
}
```

#### 사용 예시

```jsx
// 스크롤에 따라 요소 투명도 변경
const updateOpacity = rafThrottle(() => {
  const opacity = 1 - window.scrollY / 300;
  header.style.opacity = Math.max(0, opacity);
});

window.addEventListener("scroll", updateOpacity);
```

| 구분          | setTimeout throttle      | rAF throttle                     |
| ------------- | ------------------------ | -------------------------------- |
| 실행 간격     | 지정한 ms                | ~16ms (렌더링 주기)              |
| 적합한 상황   | API 호출, 비-시각적 작업 | 애니메이션, DOM 위치/스타일 변경 |
| 백그라운드 탭 | 계속 실행                | 자동으로 일시 중지               |

---

### React 커스텀 훅 — `useThrottledCallback`

#### 함수(callback) throttle

```tsx
import { useCallback, useRef } from "react";

function useThrottledCallback<T extends (...args: any[]) => any>(
  func: T,
  duration: number,
) {
  const shouldWaitRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const throttled = useCallback(
    (...args: Parameters<T>) => {
      if (!shouldWaitRef.current) {
        func(...args);
        shouldWaitRef.current = true;

        timeoutRef.current = setTimeout(() => {
          shouldWaitRef.current = false;
        }, duration);
      }
    },
    [func, duration],
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      shouldWaitRef.current = false;
    }
  }, []);

  return { throttled, cancel };
}
```

#### 사용 예시

```tsx
function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0);

  const { throttled: throttledScroll } = useThrottledCallback(() => {
    setScrollY(window.scrollY);
  }, 200);

  useEffect(() => {
    window.addEventListener("scroll", throttledScroll);
    return () => window.removeEventListener("scroll", throttledScroll);
  }, [throttledScroll]);

  return <div>스크롤 위치: {scrollY}px</div>;
}
```

---

### React 커스텀 훅 — `useThrottle` (value throttle)

#### 값(value) throttle

```tsx
import { useState, useEffect, useRef } from "react";

function useThrottle<T>(value: T, duration: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();
    const remaining = duration - (now - lastUpdated.current);

    if (remaining <= 0) {
      // duration이 지났으면 즉시 업데이트
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      // 아직 duration 중 → 남은 시간 후 업데이트
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, remaining);

      return () => clearTimeout(timer);
    }
  }, [value, duration]);

  return throttledValue;
}
```

#### 사용 예시

```tsx
function MouseTracker() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const throttledPosition = useThrottle(position, 100);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <div>
      {/* position은 mousemove마다 업데이트 */}
      <p>
        실제 위치: {position.x}, {position.y}
      </p>
      {/* throttledPosition은 100ms마다 최대 1번 업데이트 */}
      <p>
        throttle 위치: {throttledPosition.x}, {throttledPosition.y}
      </p>
    </div>
  );
}
```

---

### lodash throttle 활용

> 직접 구현 없이 실무에서 바로 쓸 수 있는 방법

```bash
npm install lodash
```

```tsx
import { throttle } from "lodash";
import { useEffect, useMemo } from "react";

function InfiniteScroll() {
  const throttledLoadMore = useMemo(
    () =>
      throttle(() => {
        const { scrollTop, scrollHeight, clientHeight } =
          document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
          loadMoreData(); // 하단 100px 내 진입 시 데이터 로드
        }
      }, 500),
    [],
  );

  useEffect(() => {
    window.addEventListener("scroll", throttledLoadMore);
    return () => {
      window.removeEventListener("scroll", throttledLoadMore);
      throttledLoadMore.cancel(); // 언마운트 시 취소
    };
  }, [throttledLoadMore]);

  return <div>...</div>;
}
```

---

### 정리

| 단계                   | 핵심                                       |
| ---------------------- | ------------------------------------------ |
| 기본 구현              | `shouldWait` 플래그 + `setTimeout`         |
| Trailing 옵션          | 구간 내 마지막 호출을 interval 후 실행     |
| Leading + Trailing     | `Date.now()`로 경과 시간 계산해서 제어     |
| cancel                 | 외부에서 타이머 강제 종료                  |
| rAF throttle           | 렌더링 주기에 맞춘 DOM/애니메이션 최적화   |
| `useThrottledCallback` | 함수를 throttle — 이벤트 핸들러에 적합     |
| `useThrottle`          | value를 throttle — 상태 업데이트 빈도 제한 |
