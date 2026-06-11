# Redux Toolkit & Zustand

# Redux Toolkit 사용법을 공식문서를 보며 직접 정리해보기 🍠

## Referential Equality란?

JavaScript에서 객체/배열/함수는 <b>참조값(메모리 주소)</b>으로 비교된다.

```tsx
const a = { count: 1 };
const b = { count: 1 };
const c = a;

console.log(a === b); // false → 내용이 같아도 주소가 다름
console.log(a === c); // true  → 같은 주소를 가리킴
```

> 원시값(`number`, `string` 등)은 값 자체로 비교되지만, 객체/배열/함수는 <b>주소(참조)</b>로 비교된다.

---

## React 렌더링 트리거 조건

React는 아래 세 가지 중 하나라도 변경되면 컴포넌트를 리렌더링한다.

| 변경 원인      | 설명                                 |
| -------------- | ------------------------------------ |
| `state` 변경   | `setState` 호출 시                   |
| `props` 변경   | 부모가 새 값을 넘길 때               |
| `Context` 변경 | `useContext`가 바라보는 값이 바뀔 때 |

이때 비교 방식은 대상에 따라 다르다.

| 대상                   | 비교 방식        | 설명                                                      |
| ---------------------- | ---------------- | --------------------------------------------------------- |
| `state` (`useState`)   | `Object.is()`    | 사실상 `===`와 거의 동일. 객체면 참조(주소)가 같은지만 봄 |
| `props` (`React.memo`) | Shallow Equality | props 객체의 각 key를 `Object.is()`로 하나씩 비교         |

**Shallow Equality**

```tsx
props
├── style → 0xAAA  ← 이 주소만 비교 (얕음)
│   ├── color: "red"  ← 여기까지는 안 봄
│   └── fontSize: 14  ← 여기까지는 안 봄
├── count → 1
└── onClick → 0xBBB  ← 이 주소만 비교 (얕음)
```

**Deep Equality**

```tsx
props
├── style
│   ├── color: "red" === "red" ✅  ← 여기까지 파고듦
│   └── fontSize: 14 === 14   ✅  ← 여기까지 파고듦
├── count → 1 === 1
└── onClick → 내부 로직까지 비교...
```

---

## 문제: 리렌더링마다 새 참조가 생성된다.

```tsx
function Parent() {
  const [count, setCount] = useState(0);

  // ❌ 렌더링마다 새 객체/함수가 생성됨
  const style = { color: "red" };
  const handleClick = () => console.log("click");

  return <Child style={style} onClick={handleClick} />;
}
```

`Parent`가 리렌더링될 때마다:

- `style`은 내용이 같아도 **새 주소의 객체**
- `handleClick`은 내용이 같아도 **새 주소의 함수**

👉 `Child`에게 전달되는 props가 매번 `===` 비교에서 `false` <br>
👉 `React.memo`로 감싸도 **무조건 리렌더링** 발생

---

## React.memo와 Referential Equality

`React.memo`는 props가 변경되지 않으면 리렌더링을 건너뛴다.
하지만 비교 방식이 <b>Shallow Equality(`===`)</b>이므로, 참조가 바뀌면 무용지물이다.

```tsx
const Child = React.memo(({ style, onClick }) => {
  console.log("Child 렌더링");
  return (
    <button style={style} onClick={onClick}>
      버튼
    </button>
  );
});
```

```tsx
function Parent() {
  const [count, setCount] = useState(0);

  // ❌ 매 렌더링마다 새 참조 → React.memo 효과 없음
  const style = { color: "red" };
  const handleClick = () => console.log("click");

  return (
    <>
      <button onClick={() => setCount((c) => c + 1)}>증가</button>
      <Child style={style} onClick={handleClick} />
    </>
  );
}
```

`React.memo`가 있어도 `count`가 바뀔 때마다 `Child`도 리렌더링된다.

---

## 해결책: useMemo / useCallback

**useMemo - 객체/배열의 참조를 유지**

```tsx
// ✅ 의존성이 바뀌지 않으면 같은 참조를 재사용
const style = useMemo(() => ({ color: "red" }), []);
```

```tsx
첫 렌더링:  style → 0xAAA (새 객체 생성)
재렌더링:   style → 0xAAA (같은 참조 반환) ← deps 변화 없으므로
```

**useCallback - 함수의 참조를 유지**

```tsx
// ✅ 의존성이 바뀌지 않으면 같은 함수 참조를 재사용
const handleClick = useCallback(() => {
  console.log("click");
}, []);
```

**적용 결과**

```tsx
function Parent() {
  const [count, setCount] = useState(0);

  const style = useMemo(() => ({ color: "red" }), []);
  const handleClick = useCallback(() => console.log("click"), []);

  return (
    <>
      <button onClick={() => setCount((c) => c + 1)}>증가</button>
      <Child style={style} onClick={handleClick} />
      {/* count가 바뀌어도 Child는 리렌더링되지 않음 ✅ */}
    </>
  );
}
```

---

## useEffect와 Referential Equality

`useEffect`의 deps 배열도 `===`로 비교한다. 객체/함수를 deps에 넣으면 의도치 않게 매번 실행될 수 있다.

```tsx
function Component({ options }) {
  useEffect(() => {
    fetchData(options);
  }, [options]); // ❌ options가 매 렌더링마다 새 참조면 매번 실행됨
}
```

```tsx
// ✅ 부모에서 useMemo로 참조를 고정하거나,
// 원시값만 deps에 넣는 방식으로 해결
useEffect(() => {
  fetchData({ type: optionType });
}, [optionType]); // 원시값만 deps에
```

---

## 상태 불변성(Immutability)과의 연결

React가 상태 변경을 감지하려면 **새 참조를 만들어야 한다.**

```tsx
// ❌ 같은 참조를 수정 → React가 변화를 감지 못함
state.count += 1;
setState(state); // state === 이전 state → 리렌더링 안 함

// ✅ 새 참조를 만들어야 함
setState({ ...state, count: state.count + 1 });
```

| 상황                 | 원하는 동작       | 방법                                      |
| -------------------- | ----------------- | ----------------------------------------- |
| 상태 변경 감지       | 리렌더링 **발생** | 새 참조 생성 (불변성 유지)                |
| props 변경 감지 차단 | 리렌더링 **방지** | 같은 참조 유지 (`useMemo`, `useCallback`) |

```tsx
렌더링 발생
    ↓
props/deps 비교 (=== Shallow Equality)
    ↓
참조가 같으면? → 리렌더링 건너뜀 (React.memo, useEffect deps)
참조가 다르면? → 리렌더링 실행
    ↓
최적화 방법:
  객체/배열 → useMemo
  함수      → useCallback
  상태 업데이트 → 새 참조 생성 (spread, map, filter 등)
```

---

<br><br>

# useCallabck과 memo 🍠

## useCallabck 에 대하여 정리해주세요! 🍠

### useCallback이 무엇인지? 🍠

`useCallback`은 **함수를 캐싱(메모이제이션)해주는 React Hook**이다.

```tsx
const cachedFn = useCallback(fn, dependencies);
```

---

### 함수를 "메모이제이션"한다는 게 무슨 뜻인지?

React 컴포넌트는 리렌더링될 때마다 내부 코드가 전부 다시 실행된다.
그래서 함수 선언도 매번 새로 실행되어 **새로운 참조(주소)의 함수**가 만들어진다.

```tsx
function Parent() {
  // 렌더링마다 새로운 함수가 생성됨
  function handleClick() {
    console.log("click");
  }
  // handleClick → 첫 렌더링: 0xAAA, 재렌더링: 0xBBB (다른 주소)
}
```

`useCallback`은 이 함수를 **캐싱**해서, 의존성이 바뀌지 않는 한 이전에 만든 함수를 그대로 반환한다

```tsx
function Parent() {
  const handleClick = useCallback(() => {
    console.log("click");
  }, []);
  // handleClick → 첫 렌더링: 0xAAA, 재렌더링: 0xAAA (같은 주소 유지)
}
```

---

### 언제 새 함수를 만들고, 언제 기존 함수를 재사용하는지?

```
첫 렌더링     → 항상 새 함수 생성 후 반환
이후 렌더링   → deps를 이전 값과 Object.is로 비교
                  변화 없음 → 이전 함수 그대로 반환 (재사용)
                  변화 있음 → 새 함수 생성 후 반환
```

```tsx
const handleSubmit = useCallback(
  (orderDetails) => {
    post("/product/" + productId + "/buy", { referrer, orderDetails });
  },
  [productId, referrer],
);
// productId나 referrer가 바뀔 때만 새 함수 생성
// 바뀌지 않으면 이전 함수 재사용
```

---

## 왜 useCallback을 사용하는지? 🍠

### 불필요한 리렌더링 방지

React는 부모가 리렌더링되면 자식도 무조건 리렌더링한다.
`React.memo`로 자식을 감싸면 props가 바뀌지 않았을 때 리렌더링을 건너뛸 수 있는데,
여기서 **함수 props의 참조가 매번 바뀌면 `React.memo`가 효과를 발휘하지 못한다.**

```tsx
// ❌ 매 렌더링마다 새 함수 → React.memo 무용지물
function Parent() {
  const handleClick = () => console.log("click");
  return <Child onClick={handleClick} />;
}

// ✅ 참조 유지 → React.memo가 리렌더링 차단
function Parent() {
  const handleClick = useCallback(() => console.log("click"), []);
  return <Child onClick={handleClick} />;
}

const Child = React.memo(({ onClick }) => {
  return <button onClick={onClick}>버튼</button>;
});
```

**핵심: `useCallback`과 `React.memo`는 세트!**

|                  | React.memo 없음 | React.memo 있음                    |
| ---------------- | --------------- | ---------------------------------- |
| useCallback 없음 | ❌ 리렌더링     | ❌ 리렌더링 (참조가 매번 바뀌므로) |
| useCallback 있음 | ❌ 리렌더링     | ✅ 리렌더링 방지                   |

---

### 성능 최적화 이득 vs 남용했을 때의 오버헤드

**이득**

- `React.memo`와 함께 쓸 때 자식 컴포넌트의 불필요한 리렌더링 방지
- `useEffect` deps에 함수가 들어갈 때 Effect의 불필요한 재실행 방지

**남용했을 때 오버헤드**

- `useCallback` 자체도 실행 비용이 있음 (deps 비교, 캐시 관리)
- 코드 가독성 저하
- 모든 memoization이 효과적인 건 아님. props 중 하나라도 "항상 새 참조"인 값이 있으면 전체 최적화가 깨짐

```tsx
// ❌ 의미 없는 useCallback (React.memo와 함께 쓰지도 않음)
function Component() {
  const handleClick = useCallback(() => {
    console.log("click");
  }, []);

  return <button onClick={handleClick}>버튼</button>; // 일반 div에 넘기는 것 → 최적화 효과 없음
}
```

> useCallback은 성능 최적화 수단입니다. 문제가 생겼을 때 추가하는 것이지, 모든 함수에 무조건 쓰는 것이 아니다.

---

## useCallback 기본 사용법 🍠

### 기본 코드

```tsx
import { useCallback } from "react";

function ProductPage({ productId, referrer, theme }) {
  const handleSubmit = useCallback(
    (orderDetails) => {
      post("/product/" + productId + "/buy", {
        referrer,
        orderDetails,
      });
    },
    [productId, referrer],
  );
  //  ↑ deps 배열: 함수 안에서 사용하는 외부 값들

  return <ShippingForm onSubmit={handleSubmit} />;
}
```

---

### deps 배열에 무엇을 넣어야 하는지?

**함수 안에서 참조하는 모든 반응형 값**을 넣어야 한다.

반응형 값이란:

- props
- state
- 컴포넌트 내부에서 선언한 변수/함수

```tsx
function Component({ userId }) {
  const [filter, setFilter] = useState("");

  const fetchData = useCallback(() => {
    fetch(`/api/user/${userId}?filter=${filter}`);
    //                  ↑ props   ↑ state
  }, [userId, filter]); // 둘 다 deps에 포함
}
```

ESLint `exhaustive-deps` 규칙을 켜두면 빠진 deps를 자동으로 경고해준다.

---

### 의존성 변경 시 콜백이 어떻게 다시 만들어지는지?

```tsx
// userId: 'A', filter: 'active' 일 때
const fetchData = useCallback(() => {
  fetch(`/api/user/A?filter=active`);
}, ["A", "active"]); // 0xAAA 함수 생성

// filter가 'inactive'로 바뀌면
const fetchData = useCallback(() => {
  fetch(`/api/user/A?filter=inactive`);
}, ["A", "inactive"]); // deps가 바뀌었으므로 0xBBB 새 함수 생성
```

---

## useCallback에서 중요한 개념 🍠

### 참조 동일성(Reference Equality)이 왜 중요한지?

JavaScript에서 객체/함수는 `===` 비교 시 **값이 아닌 참조(주소)로 비교**된다.

```tsx
const a = () => {};
const b = () => {};
console.log(a === b); // false → 내용이 같아도 주소가 다름
```

React.memo는 props를 Shallow Equality로 비교한다.
함수 props의 참조가 바뀌면 `===` 비교에서 false가 되어 리렌더링이 발생한다.
`useCallback`으로 참조를 유지해야 React.memo가 제대로 동작한다.

---

### 클로저와 상태: 콜백 안에서 state, props 사용 시 주의점

`useCallback` 안의 함수는 **클로저**이다.
함수가 생성된 시점의 값을 캡처(기억)한다.

```tsx
function Component() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log(count); // 함수가 생성될 때의 count를 캡처
  }, [count]); // count가 바뀌면 새 함수 생성 → 최신 count 캡처
}
```

deps에 값을 제대로 넣으면 항상 최신 값을 캡처한 함수가 만들어진다.

---

### Stale Closure(낡은 값 캡처) 문제

deps에 값을 빠뜨리면 함수가 **오래된 값을 캡처한 채로 재사용**된다.

```tsx
function Component() {
  const [count, setCount] = useState(0);

  // ❌ deps에 count가 없음
  const handleClick = useCallback(() => {
    console.log(count); // 항상 초기값 0만 출력 (stale closure)
  }, []); // count가 아무리 바뀌어도 함수가 새로 만들어지지 않음

  return (
    <>
      <button onClick={() => setCount((c) => c + 1)}>증가</button>
      <button onClick={handleClick}>출력</button>
    </>
  );
}
```

**해결 방법**

```tsx
// 방법 1: deps에 포함
const handleClick = useCallback(() => {
  console.log(count);
}, [count]); // ✅ count가 바뀌면 새 함수 생성

// 방법 2: 업데이터 함수 사용 (state를 직접 읽지 않아도 될 때)
const handleAdd = useCallback(() => {
  setCount((prev) => prev + 1); // prev로 최신값을 받아서 사용
}, []); // ✅ count를 읽지 않으므로 deps 불필요
```

---

## useCallabck을 사용한 콜백 메모이제이션 예시 🍠

### 부모에서 자식으로 콜백을 내려줄 때, onClick, onChange 같은 핸들러를 useCallabck 없이 넘겼을 때와 useCallabck으로 감싸서 넘겼을 때 차이

#### useCallback 없이 넘길 때

```tsx
function Parent() {
  const [count, setCount] = useState(0);

  // 렌더링마다 새 함수 생성
  const handleClick = () => console.log("click");

  return (
    <>
      <button onClick={() => setCount((c) => c + 1)}>증가</button>
      <Child onClick={handleClick} />
      {/* count가 바뀔 때마다 Child도 리렌더링 */}
    </>
  );
}

const Child = React.memo(({ onClick }) => {
  console.log("Child 렌더링");
  return <button onClick={onClick}>클릭</button>;
});
```

#### useCallback으로 감싸서 넘길 때

```tsx
function Parent() {
  const [count, setCount] = useState(0);

  // 참조 유지
  const handleClick = useCallback(() => {
    console.log("click");
  }, []);

  return (
    <>
      <button onClick={() => setCount((c) => c + 1)}>증가</button>
      <Child onClick={handleClick} />
      {/* count가 바뀌어도 handleClick 참조가 유지 → Child 리렌더링 안 함 */}
    </>
  );
}

const Child = React.memo(({ onClick }) => {
  console.log("Child 렌더링");
  return <button onClick={onClick}>클릭</button>;
});
```

---

## 이벤트 핸들러 / 비동기 로직 예시 🍠

### 버튼 클릭 시 API 호출 핸들러

```tsx
function ProductPage({ productId }) {
  const handleBuy = useCallback(async () => {
    await fetch(`/api/product/${productId}/buy`, { method: "POST" });
  }, [productId]); // productId가 바뀔 때만 새 함수 생성

  return <button onClick={handleBuy}>구매하기</button>;
}
```

---

### useEffect 안에서 의존성으로 콜백을 넣을 때

```tsx
function ChatRoom({ roomId }) {
  const createOptions = useCallback(() => {
    return { serverUrl: "https://localhost:1234", roomId };
  }, [roomId]); // roomId가 바뀔 때만 새 함수 생성

  useEffect(() => {
    const options = createOptions();
    const connection = createConnection(options);
    connection.connect();
    return () => connection.disconnect();
  }, [createOptions]); // createOptions가 바뀔 때만 Effect 재실행
}
```

더 간단한 방법은 함수를 Effect 안으로 옮기는 것!

```tsx
function ChatRoom({ roomId }) {
  useEffect(() => {
    function createOptions() {
      return { serverUrl: "https://localhost:1234", roomId };
    }
    const options = createOptions();
    const connection = createConnection(options);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]); // roomId만 deps에 있으면 충분
}
```

---

### 폼 제출 핸들러

```tsx
function OrderForm({ productId, referrer }) {
  const handleSubmit = useCallback(
    (orderDetails) => {
      post("/product/" + productId + "/buy", { referrer, orderDetails });
    },
    [productId, referrer],
  );

  return <ShippingForm onSubmit={handleSubmit} />;
}
```

---

### 디바운스 함수와 함께 사용

```tsx
import { useCallback } from "react";
import debounce from "lodash/debounce";

function SearchBar() {
  const [query, setQuery] = useState("");

  // ❌ 렌더링마다 새로운 debounce 함수 생성 → 디바운스 효과 없음
  const handleSearch = debounce((value) => {
    fetchResults(value);
  }, 300);

  // ✅ 마운트 시 한 번만 생성 → 디바운스 정상 동작
  const handleSearch = useCallback(
    debounce((value) => {
      fetchResults(value);
    }, 300),
    [], // 마운트 시 한 번만 생성
  );

  return <input onChange={(e) => handleSearch(e.target.value)} />;
}
```

---

<br>
<br>

## memo에 대하여 정리해주세요!🍠

### memo가 무엇인지? 🍠

`React.memo`는 <b>컴포넌트를 메모이제이션해주는 HOC(Higher Order Component)</b>이다.

컴포넌트를 `memo`로 감싸면, **props가 바뀌지 않았을 때 리렌더링을 건너뛴다.**

```tsx
import { memo } from "react";

const MyComponent = memo(function MyComponent({ name }) {
  return <div>{name}</div>;
});
```

**기본 동작 원리**

React는 기본적으로 부모가 리렌더링되면 자식도 무조건 리렌더링한다.

```tsx
부모 리렌더링
    ↓
자식 리렌더링 (props가 바뀌지 않아도)
    ↓
자식의 자식도 리렌더링
```

`memo`로 감싸면 props를 Shallow Equality로 비교해서, 바뀐 게 없으면 리렌더링을 건너뛴다.

```tsx
부모 리렌더링
    ↓
memo(자식) → props 비교 (Shallow Equality)
    ├── props 바뀜 → 리렌더링
    └── props 안 바뀜 → 리렌더링 건너뜀 ✅
```

**props 비교 방식: Shallow Equality**

`memo`는 props 객체의 각 key를 `Object.is()`로 하나씩 비교한다.

```tsx
// 이전 props
{ count: 1, onClick: 0xAAA }

// 새 props
{ count: 1, onClick: 0xAAA }

// 비교
Object.is(1, 1)       // true
Object.is(0xAAA, 0xAAA) // true
// 모두 같으므로 → 리렌더링 건너뜀 ✅
```

```tsx
// 이전 props
{ count: 1, onClick: 0xAAA }

// 새 props
{ count: 1, onClick: 0xBBB } // 함수가 새로 생성됨

// 비교
Object.is(1, 1)       // true
Object.is(0xAAA, 0xBBB) // false ← 참조가 다름
// 하나라도 다르면 → 리렌더링 발생 ❌
```

> <b>Shallow(얕은)</b>이라는 건, props의 각 key 값을 비교하되 그 값이 객체여도 내부까지 파고들지 않는다는 뜻이다.

## 왜 memo를 사용하는지? 🍠

**문제 상황**

```tsx
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <>
      <button onClick={() => setCount((c) => c + 1)}>증가</button>
      <ExpensiveChild /> {/* count가 바뀔 때마다 불필요하게 리렌더링 */}
    </>
  );
}

function ExpensiveChild() {
  // 렌더링 비용이 큰 컴포넌트
  console.log("ExpensiveChild 렌더링");
  return <div>복잡한 UI</div>;
}
```

`ExpensiveChilde`는 props도 없고 아무것도 바뀌지 않았는데, `count`가 바뀔 때마다 부모가 리렌더링되면서 같이 리렌더링된다.

**해결**

```tsx
const ExpensiveChild = memo(function ExpensiveChild() {
  console.log("ExpensiveChild 렌더링");
  return <div>복잡한 UI</div>;
});

// count가 아무리 바뀌어도 ExpensiveChild는 리렌더링되지 않음 ✅
```

## **`memo`** 기본 사용법 🍠

**기본 형태**

```tsx
import { memo } from "react";

// 방법 1: 함수를 직접 감싸기
const MyComponent = memo(function MyComponent({ name, count }) {
  return (
    <div>
      {name}: {count}
    </div>
  );
});

// 방법 2: 선언 후 감싸기
function MyComponent({ name, count }) {
  return (
    <div>
      {name}: {count}
    </div>
  );
}
export default memo(MyComponent);
```

**커스텀 비교 함수**

기본 Shallow Equality 대신 직접 비교 로직을 넣을 수 있다.

```tsx
const MyComponent = memo(
  function MyComponent({ user }) {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    // true 반환 → 리렌더링 건너뜀
    // false 반환 → 리렌더링 발생
    return prevProps.user.id === nextProps.user.id;
  },
);
```

> ⚠️ 커스텀 비교 함수는 정말 필요한 경우에만 써야 한다. 잘못 작성하면 UI가 업데이트되지 않는 버그가 생긴다.

**useCallback과 세트로 사용**

`memo`는 props의 함수 참조가 바뀌면 효과가 없다. 함수를 props로 넘길 때는 반드시 `useCallback`과 함께 써야 한다.

```tsx
function Parent() {
  const [count, setCount] = useState(0);

  // ❌ 매 렌더링마다 새 함수 → memo 무용지물
  const handleClick = () => console.log("click");

  // ✅ 참조 유지 → memo 정상 동작
  const handleClick = useCallback(() => console.log("click"), []);

  return <Child onClick={handleClick} />;
}

const Child = memo(function Child({ onClick }) {
  console.log("Child 렌더링");
  return <button onClick={onClick}>클릭</button>;
});
```

|                  | React.memo 없음 | React.memo 있음                    |
| ---------------- | --------------- | ---------------------------------- |
| useCallback 없음 | ❌ 리렌더링     | ❌ 리렌더링 (참조가 매번 바뀌므로) |
| useCallback 있음 | ❌ 리렌더링     | ✅ 리렌더링 방지                   |

## memo를 언제 쓰면 좋은지 / 안 좋은지 🍠

**쓰면 좋은 경우**

1️⃣ 렌더링 비용이 큰 컴포넌트

```tsx
// 복잡한 계산이나 많은 DOM을 그리는 컴포넌트
const DataGrid = memo(function DataGrid({ rows }) {
  return (
    <table>
      {rows.map((row) => (
        <Row key={row.id} data={row} />
      ))}
    </table>
  );
});
```

2️⃣ props가 자주 바뀌지 않는 컴포넌트

```tsx
// 부모는 자주 렌더링되지만 이 컴포넌트의 props는 거의 안 바뀜
const Sidebar = memo(function Sidebar({ menuItems }) {
  return <nav>{menuItems.map(...)}</nav>;
});
```

3️⃣ 리스트에서 각 아이템 컴포넌트

```tsx
// 아이템 하나가 바뀌어도 나머지 아이템은 리렌더링되지 않음
const ListItem = memo(function ListItem({ item, onDelete }) {
  return (
    <li>
      {item.name} <button onClick={onDelete}>삭제</button>
    </li>
  );
});
```

**쓰면 안 좋은 경우 (오히려 오버헤드)**

1️⃣ props가 항상 바뀌는 컴포넌트

```tsx
// 매 렌더링마다 다른 객체를 받음 → memo가 비교만 하고 어차피 리렌더링
const Component = memo(function Component({ data }) {
  return <div>{data.value}</div>;
});

function Parent() {
  // 매 렌더링마다 새 객체 생성 → memo 의미 없음
  return <Component data={{ value: "hello" }} />;
}
```

2️⃣ 렌더링 비용이 작은 단순한 컴포넌트

```tsx
// 이런 컴포넌트는 memo 비교 비용이 리렌더링 비용보다 클 수 있음
const SimpleText = memo(function SimpleText({ text }) {
  return <span>{text}</span>;
});
```

3️⃣ props에 “항상 새 참조”인 값이 하나라도 있을 때

```tsx
function Parent() {
  return (
    <MemoizedChild
      name="카사"
      // 이것 때문에 매번 새 참조 → memo 전체가 무력화
      style={{ color: "red" }}
    />
  );
}
```

---

# useMemo 🍠

## useMemo가 무엇인지? 🍠

<aside>

`useMemo`는 **계산 결과값을 캐싱해주는 React Hook**이다.

```tsx
const cachedValue = useMemo(calculateValue, dependencies);
```

`useCallback`이 **함수 자체**를 캐싱한다면, `useMemo`는 **함수의 실행 결과(값)**를 캐싱한다.

```tsx
// useCallback → 함수를 캐싱
const fn = useCallback(() => { ... }, [deps]);

// useMemo → 함수의 실행 결과를 캐싱
const value = useMemo(() => compute(), [deps]);
```

**언제 새로 계산하고, 언제 캐싱된 값을 재사용할까?**

```tsx
첫 렌더링     → 항상 계산 실행 후 결과 반환
이후 렌더링   → deps를 이전 값과 Object.is로 비교
                  변화 없음 → 이전 결과 그대로 반환 (재사용)
                  변화 있음 → 다시 계산 후 새 결과 반환
```

```tsx
const sortedList = useMemo(() => {
  return [...items].sort((a, b) => b.score - a.score);
}, [items]);
// items가 바뀔 때만 정렬 재실행
// items가 안 바뀌면 이전 정렬 결과 재사용
```

</aside>

---

## 왜 useMemo를 사용하는지? 🍠

<aside>

**1️⃣ 비용이 큰 계산을 매 렌더링마다 반복하지 않기 위해**

```tsx
function DataTable({ items, theme }) {
  // ❌ theme이 바뀌어도 매 렌더링마다 정렬 재실행
  const sortedItems = [...items].sort((a, b) => b.score - a.score);

  // ✅ items가 바뀔 때만 정렬 재실행
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => b.score - a.score);
  }, [items]);

  return <table>...</table>;
}
```

`theme`이 바뀌어 리렌더링이 발생해도, `items`가 같다면 정렬을 다시 실행하지 않는다.

2️⃣ **객체/배열의 참조를 안정적으로 유지하기 위해**

`useCallback`이 함수 참조를 유지하듯, `useMemo`는 **객체/배열의 참조**를 유지한다.

```tsx
function Parent() {
  const [count, setCount] = useState(0);

  // ❌ 렌더링마다 새 객체 생성 → 새 참조 → memo 무력화
  const style = { color: "red", fontSize: 14 };

  // ✅ count가 바뀌어도 style 참조 유지
  const style = useMemo(() => ({ color: "red", fontSize: 14 }), []);

  return <Child style={style} />;
}

const Child = memo(function Child({ style }) {
  return <div style={style}>내용</div>;
});
```

3️⃣ **useEffect deps에 객체/배열이 들어갈 때**

```tsx
function Component({ userId }) {
  // ❌ 렌더링마다 새 객체 → useEffect 매번 실행
  const options = { userId, type: "profile" };

  // ✅ userId가 바뀔 때만 새 객체 생성 → useEffect도 그때만 실행
  const options = useMemo(() => ({ userId, type: "profile" }), [userId]);

  useEffect(() => {
    fetchData(options);
  }, [options]);
}
```

</aside>

---

## useMemo 기본 사용법 🍠

<aside>

**기본 코드**

```tsx
import { useMemo } from "react";

function TodoList({ todos, filter }) {
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      if (filter === "active") return !todo.completed;
      if (filter === "completed") return todo.completed;
      return true;
    });
  }, [todos, filter]);
  // todos나 filter가 바뀔 때만 필터링 재실행

  return (
    <ul>
      {filteredTodos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

**deps 배열 규칙**

계산 함수 안에서 참조하는 **모든 반응형 값**을 넣어야 한다.

```tsx
function Component({ userId, filter }) {
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      userId, // props
      filter, // props
      page, // state
    }),
    [userId, filter, page],
  ); // 셋 다 deps에 포함
}
```

**반환값**

- 첫 렌더링: 계산 함수를 실행하고 그 결과를 반환
- 이후 렌더링: deps가 바뀌지 않으면 이전 결과를 반환, 바뀌면 다시 계산
</aside>

---

## useMemo에서 중요한 개념 🍠

<aside>

**useMemo vs useCallback**

```tsx
// useMemo → 값을 캐싱
const value = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// useCallback → 함수를 캐싱
const fn = useCallback(() => doSomething(a, b), [a, b]);

// 사실 useCallback은 useMemo로 구현 가능
const fn = useMemo(() => () => doSomething(a, b), [a, b]);
//                  ↑ 함수를 반환하는 함수
```

|           | useMemo                      | useCallback                           |
| --------- | ---------------------------- | ------------------------------------- |
| 캐싱 대상 | 계산 결과 (값, 객체, 배열)   | 함수 자체                             |
| 주 용도   | 비용 큰 계산, 객체 참조 유지 | 함수 참조 유지 (memo + 자식에게 전달) |

**남용 주의: 모든 계산에 useMemo를 쓰면 안 되는 이유**

`useMemo` 자체도 실행 비용이 있다. deps 비교, 캐시 저장/조회가 발생한다. 단순한 계산에 쓰면 오히려 오버헤드가 생긴다.

```tsx
// ❌ 이런 단순한 계산에는 useMemo 불필요
const double = useMemo(() => count * 2, [count]);

// ✅ 그냥 쓰면 됨
const double = count * 2;
```

**useMemo가 효과적인 경우:**

- 배열 정렬, 필터링, 복잡한 수식 계산처럼 실제로 비용이 큰 경우
- `memo`로 감싼 자식에게 객체/배열을 props로 넘길 때
- `useEffect` deps에 객체/배열이 들어갈 때

**캐시 유지 보장 없음**

`useCallback`과 마찬가지로 `useMemo`도 캐시가 항상 유지된다는 보장이 없다.

- 개발 환경에서 파일을 편집할 때
- Suspense에 의해 마운트가 중단될 때

따라서 `useMemo`는 **성능 최적화 수단**이지, 캐시가 반드시 유지된다는 전제로 로직을 짜면 안 된다.

**불변성과의 관계**

`useMemo`가 효과를 발휘하려면 deps로 넘기는 값이 **불변성을 지켜야** 한다.

```tsx
// ❌ items 배열을 직접 수정하면 참조가 같아서 useMemo가 변화를 감지 못함
items.push(newItem);
setState(items); // items 참조가 그대로라서 useMemo 재실행 안 함

// ✅ 새 배열을 만들어야 useMemo가 변화를 감지하고 재계산
setState([...items, newItem]); // 새 참조 → useMemo 재실행
```

</aside>

---

## useMemo 실전 예시 🍠

<aside>

**비용이 큰 계산 캐싱**

```tsx
function ProductList({ products, searchQuery }) {
  // 검색 필터링 + 정렬을 매 렌더링마다 하지 않고 캐싱
  const filteredProducts = useMemo(() => {
    console.log("필터링 실행");
    return products
      .filter((p) => p.name.includes(searchQuery))
      .sort((a, b) => a.price - b.price);
  }, [products, searchQuery]);

  return (
    <ul>
      {filteredProducts.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

**객체 참조 유지 (memo와 함께)**

```tsx
function UserPage({ userId, theme }) {
  // theme이 바뀌어도 userConfig 참조 유지
  const userConfig = useMemo(
    () => ({
      userId,
      endpoint: `/api/user/${userId}`,
      retries: 3,
    }),
    [userId],
  );

  return <UserProfile config={userConfig} />;
}

const UserProfile = memo(function UserProfile({ config }) {
  // config 참조가 유지되면 리렌더링 안 함
  return <div>{config.userId}</div>;
});
```

**useEffect deps에 객체 사용**

```tsx
function ChatRoom({ roomId, serverUrl }) {
  const connectionOptions = useMemo(
    () => ({
      serverUrl,
      roomId,
    }),
    [serverUrl, roomId],
  );

  useEffect(() => {
    const connection = createConnection(connectionOptions);
    connection.connect();
    return () => connection.disconnect();
  }, [connectionOptions]); // roomId나 serverUrl이 바뀔 때만 재연결
}
```

**파생 상태 계산**

```tsx
function ShoppingCart({ cartItems }) {
  // 장바구니 총액 계산을 캐싱
  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  // 할인 적용 여부 계산
  const hasDiscount = useMemo(() => {
    return totalPrice >= 50000;
  }, [totalPrice]);

  return (
    <div>
      <p>총액: {totalPrice}원</p>
      {hasDiscount && <p>5,000원 할인 적용!</p>}
    </div>
  );
}
```

**Context value 최적화**

```tsx
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }, []);

  // value가 매 렌더링마다 새 객체가 되면 모든 하위 컴포넌트 리렌더링 발생
  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
    }),
    [theme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
```

</aside>
