# Redux Toolkit & Zustand

## Redux Toolkit 사용법을 공식문서를 보며 직접 정리해보기 🍠

## Provider 🍠

> 문서: https://react-redux.js.org/api/provider

---

## Provider

> Redux store를 React 컴포넌트 트리 전체에 주입해주는 컴포넌트

React store는 React 외부에 존재하는 순수 JS 객체이다. React 컴포넌트들이 이 store에 접근하려면 누군가가 “연결”을 해줘야 하는데, 그 역할을 `<Provider>`가 담당한다.

내부적으로는 React Context API를 사용해서 store를 하위 컴포넌트에 전파한다.
👉 `useSelector`, `useDispatch` 같은 훅들이 어디서든 store에 접근 가능

```jsx
<Provider store={store}>   ← 여기서 Context에 store를 넣음
  <App />
    <Header />             ← useSelector 사용 가능
    <Main />               ← useDispatch 사용 가능
      <SomeDeepComponent /> ← 여기서도 접근 가능
```

---

## Props

| Prop             | 필수 여부 | 설명                                  |
| ---------------- | --------- | ------------------------------------- |
| `store`          | ✔필수     | `configureStore()`로 만든 Redux store |
| `children`       | ✔필수     | 감싸줄 컴포넌트 트리(`<App />`등)     |
| `serverState`    | 선택      | SSR 하이드레이션용. v8.0에서 추가     |
| `context`        | 선택      | 커스텀 Context 사용 시                |
| `stabilityCheck` | 선택      | `useSelector` 안정성 검사 전역 설정   |

```jsx
interface ProviderProps<A extends Action = AnyAction, S = any> {
  /*
   * 애플리케이션에서 사용하는 단일 Redux store
   */
  store: Store<S, A>

  /*
   * 선택적으로 서버 상태 스냅샷을 전달할 수 있다.
   * 값이 있을 경우 초기 하이드레이션 렌더링 시 사용되어,
   * 서버에서 생성된 HTML과 UI 출력이 일치하도록 보장한다.
   * v8.0에서 새롭게 추가됨
   */
  serverState?: S

  /*
   * react-redux 내부적으로 사용할 커스텀 Context를 지정할 수 있다.
   * React.createContext()로 생성한 context를 넘기면 됨
   * 이 옵션을 사용할 경우, connect에도 동일한 context를 전달해 줘야 한다.
   * 초기값은 null로 설정하며, Provider가 이를 덮어쓰지 않으면 hooks에서 에러 발생
   */
  context?: Context<ReactReduxContextValue<S, A> | null>

  /* `useSelector`의 안정성 검사(stability check)에 대한 전역 설정 */
  stabilityCheck?: StabilityCheck

  /* <App />과 같이 컴포넌트 트리의 최상위 React 엘리먼트. */
  children: ReactNode
}
```

---

## React 18 SSR 사용법

| 용어                   | 설명                                                                      |
| ---------------------- | ------------------------------------------------------------------------- |
| **SSR**                | 서버에서 HTML을 미리 렌더링해서 클라이언트에 내려주는 방식                |
| **Hydration**          | 서버가 만든 HTML에 React가 이벤트 핸들러 등을 붙여 "살아있게" 만드는 과정 |
| **Hydration Mismatch** | 서버 HTML과 클라이언트 렌더링 결과가 달라서 생기는 불일치 오류            |

**문제 상황**

SSR에서는 서버가 Redux 상태를 가지고 HTML을 만든다. 그런데 클라이언트에서 `hydrateRoot`로 붙일 때 상태가 다르면 React가 경고를 뱉거나 UI가 깜빡인다.

```jsx
서버: store 상태 { user: "카사" } → HTML 생성
클라이언트: store 상태 {} (초기값) → 렌더링 결과 다름 → ❌ mismatch
```

**해결책: `serverState` prop**

서버에서 내려준 상태를 `serverState`로 전달하면, React가 초기 하이드레이션 시에만 이 상태를 기준으로 렌더링한다. 그 이후엔 클라이언트 상태로 자연스럽게 전환

```jsx
const preloadedState = window.__PRELOADED_STATE__; // 서버가 심어준 상태

const clientStore = configureStore({
  reducer: rootReducer,
  preloadedState, // ← 1) store 초기값
});

hydrateRoot(
  document.getElementById("root"),
  <Provider store={clientStore} serverState={preloadedState}>
    {/*                          ↑ 2) 하이드레이션 기준값으로도 전달 */}
    <App />
  </Provider>,
);
```

`preloadedState`를 두 군데 사용한다.

| 전달 위치                                 | 역할                                                |
| ----------------------------------------- | --------------------------------------------------- |
| `configureStore({ preloadedState })`      | store의 초기 상태를 서버 상태로 채움                |
| `<Provider serverState={preloadedState}>` | 하이드레이션 렌더링 기준값으로 사용해 mismatch 방지 |

---

## 예제

### 기본 사용법

> **`<Provider>`는 항상 앱의 최상단에 위치**해야 한다.
> store에 접근해야 하는 컴포넌트가 반드시 `<Provider>` 하위에 있어야 하기 때문

```jsx
// main.tsx 또는 index.tsx
import { Provider } from 'react-redux'
import { store } from './store'
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <Provider store={store}>
    <App />
  </Provider>
)
```

### React 18 SSR 하이드레이션

SSR 환경에서는 서버에서 미리 렌더링된 HTML과 클라이언트의 React 렌더링 결과가 일치해야 한다. 상태가 다르면 hydration mismatch가 발생하는데, `serverState`가 이를 방지해준다.

**`src/index.ts`**

```jsx
const preloadedState = window.__PRELOADED_STATE__; // 서버에서 내려준 상태

const clientStore = configureStore({
  reducer: rootReducer,
  preloadedState, // ← store 초기값으로도 사용
});

hydrateRoot(
  document.getElementById("root"),
  <Provider store={clientStore} serverState={preloadedState}>
    {/* serverState도 동일하게 전달 ↑ */}
    <App />
  </Provider>,
);
```

---

## 커스텀 Context

한 앱에 Redux store를 여러 개 운용해야 할 때 사용한다. 기본적으로 React-Redux는 내장된 Context를 쓰는데, 여러 store가 있으면 각각 다른 Context로 구분해야 한다.

> 일반적인 앱에서는 store가 하나이므로 쓸 일이 거의 없다.

**사용법**

```jsx
const MyContext = React.createContext(null) // 초기값은 반드시 null

// Provider에 전달
<Provider store={store} context={MyContext}>
  <App />
</Provider>

// connect를 쓰는 컴포넌트에도 동일한 context를 전달해야 함
connect(mapState, null, null, { context: MyContext })(MyComponent)
```

**규칙**

`<Provider>`에 커스텀 context를 넘겼다면, 그, store에 연결된 모든 컴포넌트에도 동일한 context를 전달해야 한다.

```jsx
Provider (context: MyContext) ✅
    ↓
connect({ context: MyContext }) ✅ → 정상 동작
connect()                       ❌ → 런타임 에러 발생
```

**어기면 생기는 에러**

<aside>
⚠️

**Invariant Violation**:
"Connect(MyComponent)"의 context에서 "store"를 찾을 수 없습니다.
루트 컴포넌트를 <Provider>로 감싸거나,
<Provider>에 커스텀 React context provider를,
connect 옵션의 Connect(Todo)에 해당하는 React context consumer를 각각 전달해 주세요.

</aside>

- 해당 컴포넌트가 `<Provider>` 하위에 있는지,
- 커스텀 context를 쓰고 있다면 `connect`에도 동일한 context를 넘겼는지 확인할 것

---

<br><br>

## configureStore 🍠

> 문서: https://redux-toolkit.js.org/api/configureStore

---

## `configureStore`

> Redux store를 설정 한 번으로 만들어주는 표준 메서드. 내부적으로는 Redux core의 `createStore`를 쓰지만, 개발 경험을 높이기 위한 좋은 기본값들을 자동으로 세팅해줌.

기존 Redux에서 store를 세팅하기 위해 해야 했던 작업들:

- 슬라이스 reducer들을 root reducer로 합치기(`combineReducers`)
- thunk 등 미들웨어 등록 (`applyMiddleware`)
- Redux DevTools 연결
- `createStore` 호출

👉 수십 줄의 보일러플레이트가 필요했던 작업들을 `configureStore` 한 번 호출로 전부 처리 가능

**`configureStore`가 자동으로 해주는 것**

| 자동 처리 항목          | 설명                                             |
| ----------------------- | ------------------------------------------------ |
| `combineReducers` 호출  | `reducer`에 객체를 넘기면 자동으로 합쳐줌        |
| thunk 미들웨어 등록     | 별도 설정 없이 기본 포함                         |
| 개발 환경 검사 미들웨어 | 실수로 state를 직접 변경하는 등의 흔한 실수 감지 |
| Redux DevTools 연결     | 자동으로 브라우저 확장과 연결                    |
| `createStore` 호출      | 위 설정들을 모아서 store 생성                    |

---

## Parameters

> `configureStore`는 설정 객체 하나를 인자로 받는다.

### `reducer`

필수 항목으로, 단일 reducer 함수 또는 슬라이스 reducer들의 객체를 받는다.

```jsx
// 단일 함수로 넘기는 경우
configureStore({ reducer: rootReducer });

// 객체로 넘기는 경우 → 자동으로 combineReducers 처리
configureStore({
  reducer: {
    users: usersReducer,
    posts: postsReducer,
  },
});
```

---

### `middleware`

선택 항목으로, `getDefaultMiddleware`를 인자로 받는 콜백 함수를 넘긴다. 반환값이 최종 미들웨어 배열이 된다.

```jsx
// 기본 미들웨어에 logger 추가
configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});
```

> 이 옵션을 생략하면 `getDefaultMiddleware()`의 반환값이 자동으로 사용된다.

**TypeScript 사용 시 주의:** 일반 배열 대신 반드시 `Tuple`을 사용해야 타입 추론이 정확하다.

```jsx
import { configureStore, Tuple } from "@reduxjs/toolkit";

configureStore({
  reducer: rootReducer,
  middleware: () => new Tuple(additionalMiddleware, logger),
});
```

---

### `devTools`

선택 항목으로, Redux DevTools 브라우저 확장 연결 여부를 설정한다. 기본값은 `true`

```jsx
// 프로덕션에서는 끄는 패턴
devTools: process.env.NODE_ENV !== "production";

// 옵션 객체로 세부 설정도 가능
devTools: {
  trace: true;
}
```

---

### `duplicateMiddlewareCheck`

선택 항목으로, 동일한 미들웨어가 중복 등록됐는지 검사한다. 기본값은 `true`

- RTK Query API 미들웨어를 실수로 두 번 추가하는 등의 실수를 잡아준다.

---

### `preloadedState`

선택 항목으로, store의 초기 상태를 직접 지정할 때 사용한다.

```jsx
const preloadedState = {
  todos: [{ text: "Eat food", completed: true }],
  visibilityFilter: "SHOW_COMPLETED",
};

configureStore({ reducer, preloadedState });
```

- SSR 환경에서 서버 상태를 클라이언트 store에 주입할 때 주로 사용

---

### `enhancers`

선택 항목으로, 미들웨어보다 낮은 레벨의 store enhancer를 커스터마이징할 때 사용

```jsx
// 기본 enhancer에 offline enhancer 추가
configureStore({
  reducer,
  enhancers: (getDefaultEnhancers) =>
    getDefaultEnhancers().concat(offline(offlineConfig)),
});
```

<aside>
⚠️

`getDefaultEnhancers`를 사용하지 않고 배열을 직접 반환하면 `applyMiddleware`가 포함되지 않는다. 이 경우 미들웨어가 작동하지 않으니 주의할 것!

```jsx
// ❌ middleware를 설정했지만 enhancers에 포함 안 됨 → 경고 발생
configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  enhancers: [offline(offlineConfig)], // applyMiddleware 빠짐
});

// ✅ getDefaultEnhancers로 기본값 유지하며 추가
configureStore({
  reducer,
  enhancers: (getDefaultEnhancers) =>
    getDefaultEnhancers().concat(offline(offlineConfig)),
});
```

</aside>

---

## 전체 사용 예제

```jsx
import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import { batchedSubscribe } from "redux-batched-subscribe";
import todosReducer from "./todos/todosReducer";
import visibilityReducer from "./visibility/visibilityReducer";

const store = configureStore({
  reducer: {
    todos: todosReducer,
    visibility: visibilityReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  devTools: process.env.NODE_ENV !== "production",
  preloadedState: {
    todos: [{ text: "Eat food", completed: true }],
  },
  enhancers: (getDefaultEnhancers) =>
    getDefaultEnhancers({ autoBatch: false }).concat(
      batchedSubscribe(debounceNotify),
    ),
});
```

---

<br><br>

## createSlice 🍠

> 문서: https://redux-toolkit.js.org/api/createSlice

---

## `createSlice`

> 초기 상태, reducer 함수들, slice 이름을 받아서 **action creator와 action type을 자동으로 생성**해주는 함수. Redux 로직을 작성하는 표준 방식.

내부적으로 `createAction`과 `createReducer`를 사용하고, **Immer**가 내장되어 있어서 state를 직접 변경하는 것처럼 작성해도 불변성이 유지된다.

### 기본 사용 예시

```jsx
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment(state) {
      state.value++ // Immer 덕분에 직접 변경해도 OK
    },
    decrement(state) {
      state.value--
    },
    incrementByAmount(state, action: PayloadAction<number>) {
      state.value += action.payload
    },
  },
})

export const { increment, decrement, incrementByAmount } = counterSlice.actions
export default counterSlice.reducer
```

---

## Parameters

### `name` ✅ 필수

slice의 이름 문자열. **action type의 prefix**로 사용된다.

```jsx
name: "counter";
// → action type이 'counter/increment', 'counter/decrement' 형태로 생성됨
```

---

### `initialState` ✅ 필수

이 slice의 초기 상태값으로 함수로도 전달할 수 있다 (lazy initializer).

```jsx
// 값으로 전달
initialState: {
  value: 0;
}

// lazy initializer - localStorage 같은 외부에서 읽을 때 유용
initialState: () => {
  const saved = localStorage.getItem("count");
  return { value: saved ? Number(saved) : 0 };
};
```

---

### `reducers` ✅ 필수

action을 처리하는 함수들의 객체. 키 이름이 곧 action type의 suffix가 된다.\

```jsx
reducers: {
  increment: (state) => state + 1,
  // → 'counter/increment' action을 처리
}
```

#### prepare callback으로 action creator 커스터마이징

action의 payload를 가공해야 할 때, 함수 대신 `{ reducer, prepare }` 객체를 넘긴다.

```jsx
reducers: {
  addTodo: {
    reducer: (state, action: PayloadAction<Item>) => {
      state.push(action.payload)
    },
    prepare: (text: string) => {
      const id = nanoid() // payload에 id를 자동 생성해서 넣음
      return { payload: { id, text } }
    },
  },
}
```

#### creator callback 방식 (심화)

`reducers`에 객체 대신 콜백 함수를 넘기면 `create` 객체를 활용할 수 있다. async thunk를 slice 안에서 정의할 수 있다는 게 가장 큰 장점이다.

```jsx
reducers: (create) => ({
  // 일반 reducer
  deleteTodo: create.reducer<number>((state, action) => {
    state.todos.splice(action.payload, 1)
  }),

  // prepare + reducer 조합
  addTodo: create.preparedReducer(
    (text: string) => ({ payload: { id: nanoid(), text } }),
    (state, action) => { state.todos.push(action.payload) }
  ),

  // async thunk (아래 별도 설명 참고)
  fetchTodo: create.asyncThunk(
    async (id: string) => {
      const res = await fetch(`myApi/todos?id=${id}`)
      return await res.json()
    },
    {
      pending: (state) => { state.loading = true },
      fulfilled: (state, action) => {
        state.loading = false
        state.todos.push(action.payload)
      },
      rejected: (state) => { state.loading = false },
    }
  ),
})
```

<aside>
⚠️

`create.asyncThunk`는 기본 `createSlice`에서 바로 쓸 수 없다. 별도 설정 필요:

```jsx
import { buildCreateSlice, asyncThunkCreator } from "@reduxjs/toolkit";

export const createAppSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});
// 이후 createSlice 대신 createAppSlice를 사용
```

</aside>

---

### `extraReducers` (선택)

**다른 slice나 외부에서 정의된 action에 반응**하고 싶을 때 사용한다. `reducers`와 달리 새로운 action type을 생성하지 않는다.

```jsx
const userSlice = createSlice({
  name: 'user',
  initialState: { name: '', age: 20 },
  reducers: { ... },
  extraReducers: (builder) => {
    builder
      // 다른 slice의 action에 반응
      .addCase(counter.actions.increment, (state) => {
        state.age += 1
      })
      // 특정 조건에 맞는 모든 action에 반응
      .addMatcher(
        (action) => action.type.endsWith('rejected'),
        (state, action) => { /* 에러 처리 */ }
      )
      // 아무것도 매칭 안 됐을 때
      .addDefaultCase((state, action) => {})
  },
})
```

- `reducers`와 `extraReducers`가 동일한 action type을 처리하면 `reducers`가 우선

---

### `selectors` (선택)

slice state를 첫 번째 인자로 받는 selector 함수들을 정의할 수 있다.

```jsx
const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0 },
  reducers: {},
  selectors: {
    selectValue: (state) => state.value,
  },
});

const { selectValue } = counterSlice.selectors;
selectValue({ counter: { value: 2 } }); // → 2
```

<aside>
⚠️

셀렉터 안에서 같은 slice의 다른 셀렉터를 참조하면 **순환 타입 에러**가 발생할 수 있다. 반환 타입을 명시적으로 지정하면 해결.

```jsx
// ❌ 순환 타입 에러
selectTimes: (state, times = 1) =>
  counterSlice.getSelectors().selectValue(state) * times

// ✅ 반환 타입 명시로 해결
selectTimes: (state, times = 1): number =>
  counterSlice.getSelectors().selectValue(state) * times
```

</aside>

---

### `reducerPath` (선택)

slice가 store에서 어느 위치에 있는지를 힌트로 주는 문자열로 기본값은 `name`과 동일하다. `combineSlices`와 `slice.selectors`에서 사용된다.

---

## Return Value

`createSlice`가 반환하는 객체의 주요 필드들

| 필드              | 설명                                                    |
| ----------------- | ------------------------------------------------------- |
| `actions`         | reducers에 정의된 함수들에 대응하는 action creator 객체 |
| `reducer`         | `configureStore`의 `reducer`에 넘길 slice reducer 함수  |
| `caseReducers`    | reducers에 정의된 원본 함수들 (테스트 시 유용)          |
| `getInitialState` | 초기 상태를 반환하는 함수                               |
| `selectors`       | `reducerPath` 기준으로 래핑된 selector 객체             |
| `getSelectors`    | 커스텀 `selectState`를 넘겨 selector를 가져오는 함수    |
| `selectSlice`     | `rootState[reducerPath]`를 반환하는 내장 selector       |
| `injectInto`      | `combineSlices`와 함께 동적으로 slice를 주입할 때 사용  |

```jsx
// 일반적인 내보내기 패턴
export const { increment, decrement } = counterSlice.actions;
export default counterSlice.reducer;
```

### `selectors` vs `getSelectors`

|           | `slice.selectors`                                 | `slice.getSelectors(fn)`                   |
| --------- | ------------------------------------------------- | ------------------------------------------ |
| 사용 시점 | slice가 `reducerPath` 위치에 정확히 마운트된 경우 | slice 위치가 다르거나 커스텀이 필요한 경우 |
| 사용법    | `selectValue(rootState)`                          | `getSelectors((state) => state.aCounter)`  |

```jsx
// slice.selectors — 기본 사용
const { selectValue } = counterSlice.selectors
selectValue({ counter: { value: 2 } }) // → 2

// getSelectors — 위치가 다를 때
const { selectValue } = counterSlice.getSelectors(
  (rootState: RootState) => rootState.aCounter
)
selectValue({ aCounter: { value: 2 } }) // → 2
```

---

### 전체 동작 예시

```tsx
const counter = createSlice({
  name: "counter",
  initialState: 0,
  reducers: {
    increment: (state) => state + 1,
    decrement: (state) => state - 1,
    multiply: {
      reducer: (state, action: PayloadAction<number>) => state * action.payload,
      prepare: (value?: number) => ({ payload: value || 2 }),
    },
  },
  extraReducers: (builder) => {
    builder.addCase(incrementBy, (state, action) => state + action.payload);
  },
});

store.dispatch(counter.actions.increment()); // 0 → 1
store.dispatch(counter.actions.multiply(3)); // 1 → 3
store.dispatch(counter.actions.multiply()); // prepare로 기본값 2 적용 → 6
console.log(counter.actions.decrement.type); // "counter/decrement"
```

---

<br><br>

## useSelector 🍠

> 문서: https://react-redux.js.org/api/hooks#useselector

## `useSelector()`

> Redux store의 state에서 필요한 데이터를 꺼내오는 훅

```tsx
const result = useSelector(
  selector: (state: RootState) => Selected,
  options?: EqualityFn | UseSelectorOptions
)
```

### 동작 방식

- selector는 store 전체 state를 인자로 받아 원하는 값을 반환한다.
- action이 dispatch될 때마다 selector가 다시 실행되고, 이전 결과와 `===` 참조 비교를 한다.
  - 다르면 → 리렌더링
  - 같으면 → 리렌더링 없음

### 기본 사용

```tsx
const counter = useSelector((state) => state.counter);

// props 활용도 가능
const todo = useSelector((state) => state.todos[props.id]);
```

---

## 동등성 비교와 리렌더링

기본 비교가 `===` 이기 때문에 **객체를 반환하면 매번 새 참조 → 항상 리렌더링된다.**

```tsx
// ❌ 매번 새 객체 반환 → 항상 리렌더링
const { count, user } = useSelector((state) => ({
  count: state.count,
  user: state.user,
}));
```

### 해결 방법

#### 1️⃣ `useSelector` 여러 번 호출 (가장 단순)

```tsx
const count = useSelector((state) => state.count.value);
const user = useSelector((state) => state.auth.currentUser);
```

#### 2️⃣ `shallowEqual` 사용

```tsx
import { shallowEqual, useSelector } from "react-redux";

const selectedData = useSelector(selectorReturningObject, shallowEqual);
```

#### 3️⃣ `createSelector`로 메모이제이션

```tsx
// 컴포넌트 밖에 선언해야 함 (안에 선언하면 매번 새 인스턴스 생성)
const selectNumCompletedTodos = createSelector(
  (state) => state.todos,
  (todos) => todos.filter((todo) => todo.completed).length,
);

const numCompletedTodos = useSelector(selectNumCompletedTodos);
```

---

## 개발 모드 검사

### 1️⃣ Selector 결과 안정성 검사

같은 입력으로 selector를 한 번 더 실행했을 때 결과가 다르면 경고를 띄운다.

```tsx
// 전역 설정
<Provider store={store} stabilityCheck="always">

// 개별 설정
useSelector(selectCount, { devModeChecks: { stabilityCheck: 'never' } })
```

### 2️⃣ Identity Function 검사

`state => state`처럼 전체 state를 그대로 반환하면 경고를 띄운다.

```tsx
// ❌ 전체 state 반환 → 뭔가 바뀌면 무조건 리렌더링
const { count, user } = useSelector((state) => state);

// ✅ 필요한 값만
const count = useSelector((state) => state.count.value);
```

---

## `connect`와의 차이점

|                  | `useSelector`             | `connect`의 `mapState` |
| ---------------- | ------------------------- | ---------------------- |
| 반환값           | 어떤 값이든 가능          | 항상 객체              |
| 비교 방식        | `===` 참조 비교 (기본)    | 얕은 비교              |
| `ownProps`       | 받지 않음 (클로저로 대체) | 두 번째 인자로 받음    |
| 여러 값 가져오기 | 여러 번 호출 권장         | 하나의 객체로 반환     |

---

<br><br>

## useDispatch 🍠

> 문서: https://react-redux.js.org/api/hooks#usedispatch

---

## `useDispatch()`

> Redux store의 **`dispatch` 함수를 가져오는** 훅

```tsx
const dispatch = useDispatch();
```

**기본 사용**

```tsx
import { useDispatch } from "react-redux";

export const CounterComponent = ({ value }) => {
  const dispatch = useDispatch();

  return (
    <div>
      <span>{value}</span>
      <button onClick={() => dispatch({ type: "increment-counter" })}>
        Increment counter
      </button>
    </div>
  );
};
```

---

## `useCallback`과 함께 쓰기

`dispatch`를 자식 컴포넌트에 콜백으로 내려줄 때, `React.memo()`로 최적화된 자식이 불필요하게 리렌더링되지 않도록 `useCallback`으로 감싸는 게 좋다.

```tsx
const dispatch = useDispatch();

const incrementCounter = useCallback(
  () => dispatch({ type: "increment-counter" }),
  [dispatch], // dispatch는 store가 바뀌지 않는 한 안정적
);
```

---

### `dispatch`는 안정적인 참조

`dispatch` 함수는 동일한 store 인스턴스가 `<Provider>`에 전달되는 한 **항상 같은 참조**를 유지한다. 앱에서 store가 바뀌는 일은 거의 없으니 사실상 안정적이다.

단, React hooks lint 규칙은 이를 인식하지 못해서 `useEffect`, `useCallback` 의존성 배열에 추가하라고 경고할 수 있다. (그냥 추가하면 됨)

```tsx
useEffect(() => {
  dispatch(fetchTodos());
}, [dispatch]); // 추가해도 안전
```

---

<br><br>

## Zustand 🍠

## Zustand란 무엇인가요? 🍠

**Zustand**는 React 애플리케이션을 위한 **경량 전역 상태 관리 라이브러리**이다.

독일어로 "상태(State)"를 의미하며, Redux보다 훨씬 적은 보일러플레이트 코드로 전역 상태를 관리할 수 있다.

- **번들 사이즈**: 약 1KB (매우 가벼움)
- **의존성**: React에만 의존 (Redux처럼 별도 미들웨어 필요 없음)
- **불변성 자동 처리**: `set` 함수가 내부적으로 처리

---

<br>

## 왜 **Zustand**를 사용할까요? 🍠

| 비교 항목       | Redux | Context API | Zustand              |
| --------------- | ----- | ----------- | -------------------- |
| 보일러플레이트  | 많음  | 보통        | 적음                 |
| 번들 사이즈     | 큼    | 기본 내장   | 매우 작음            |
| 리렌더링 최적화 | 수동  | 어려움      | 선택적 구독으로 간단 |
| 학습 비용       | 높음  | 낮음        | 매우 낮음            |
| DevTools        | 지원  | 미지원      | 지원                 |

**핵심 장점 3가지:**

1. 설정 없이 바로 사용 가능 (Provider 감싸지 않아도 됨)
2. 선택적 구독으로 불필요한 리렌더링 방지
3. 직관적인 API로 낮은 학습 비용

---

<br>

## Zustand 기본 사용법 🍠

### 설치

```bash
npm install zustand
```

### 1) Store 만들기

```bash
import { create } from 'zustand'

// 타입 정의
type BearStore = {
  bears: number
  increase: () => void
  reset: () => void
}

// 스토어 생성
const useBearStore = create<BearStore>()((set) => ({
  bears: 0,
  increase: () => set((state) => ({ bears: state.bears + 1 })),
  reset: () => set({ bears: 0 }),
}))
```

### 2) 컴포넌트에서 사용하기

```bash
function BearCounter() {
  // 필요한 상태만 선택적으로 구독
  const bears = useBearStore((state) => state.bears)

  return <h1>{bears} bears around here...</h1>
}

function Controls() {
  const increase = useBearStore((state) => state.increase)
  const reset = useBearStore((state) => state.reset)

  return (
    <>
      <button onClick={increase}>곰 추가 +</button>
      <button onClick={reset}>초기화</button>
    </>
  )
}
```

> ✅ `Provider`로 감쌀 필요 없이 바로 사용 가능!!

---

<br>

## Zustand에서 중요한 개념 🍠

### 1) set 함수

상태를 **업데이트**할 때 사용

```tsx
// 방법 1: 객체를 직접 전달 (얕은 병합)
set({ bears: 10 });

// 방법 2: 이전 상태를 기반으로 업데이트 (함수형)
set((state) => ({ bears: state.bears + 1 }));

// 방법 3: 완전히 교체 (replace: true)
set({ bears: 0 }, true); // 두 번째 인자 true = 병합 아닌 교체
```

> ⚠️ 기본적으로 `set`은 **얕은 병합(shallow merge)** 을 수행한다.
> 중첩 객체는 수동으로 스프레드해야 함

### 2) get 함수

스토어 **내부에서 현재 상태를 읽을 때** 사용

```tsx
const useStore = create<Store>()((set, get) => ({
  count: 0,
  doubled: () => {
    const current = get().count; // 현재 상태를 읽음
    return current * 2;
  },
  increment: () => {
    const current = get().count;
    set({ count: current + 1 });
  },
}));
```

> `get`은 액션 함수 내부에서 다른 상태값을 참조해야 할 때 유용하다.

### 3) 선택적 구독 (selector)

컴포넌트가 **필요한 상태만** 구독하여 불필요한 리렌더링을 방지.

```tsx
// ❌ 비효율적: 스토어 전체를 구독 → bears, fishes 중 뭐가 바뀌어도 리렌더링
const store = useBearStore();

// ✅ 효율적: bears만 구독 → bears가 바뀔 때만 리렌더링
const bears = useBearStore((state) => state.bears);
```

---

<br>

## Zustand 객체 상태 관리 예시 🍠

객체 타입 상태는 중첩 업데이트 시 **스프레드 연산자**로 불변성을 유지해야 한다.

```tsx
type UserStore = {
  user: {
    name: string;
    age: number;
    address: {
      city: string;
      country: string;
    };
  };
  setName: (name: string) => void;
  setCity: (city: string) => void;
  resetUser: () => void;
};

const initialUser = {
  name: "홍길동",
  age: 25,
  address: {
    city: "서울",
    country: "한국",
  },
};

const useUserStore = create<UserStore>()((set) => ({
  user: initialUser,

  // 1단계 중첩 업데이트
  setName: (name) =>
    set((state) => ({
      user: { ...state.user, name },
    })),

  // 2단계 중첩 업데이트 (스프레드 두 번 필요)
  setCity: (city) =>
    set((state) => ({
      user: {
        ...state.user,
        address: { ...state.user.address, city },
      },
    })),

  resetUser: () => set({ user: initialUser }),
}));
```

---

<br>

## Zustand 비동기 로직 예시 🍠

Zustand에서는 비동기 API 호출도 간단하게 store 안에서 사용할 수 있다.

```tsx
type PostStore = {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
};

type Post = {
  id: number;
  title: string;
  body: string;
};

const usePostStore = create<PostStore>()((set) => ({
  posts: [],
  isLoading: false,
  error: null,

  fetchPosts: async () => {
    // 로딩 시작
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts",
      );
      const data: Post[] = await response.json();

      set({ posts: data, isLoading: false });
    } catch (error) {
      set({ error: "데이터를 불러오지 못했습니다.", isLoading: false });
    }
  },
}));

// 컴포넌트에서 사용
function PostList() {
  const { posts, isLoading, error, fetchPosts } = usePostStore();

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <button onClick={fetchPosts}>포스트 불러오기</button>
      {posts.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

---

<br>

## Zustand + Persist 미들웨어 🍠

Zustand는 미들웨어를 활용해 로컬스토리지 등에 상태를 저장할 수 있다.

```tsx
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type AuthStore = {
  token: string | null;
  user: { id: number; name: string } | null;
  setToken: (token: string) => void;
  logout: () => void;
};

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      setToken: (token) => set({ token }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: "auth-storage", // localStorage 키 이름
      storage: createJSONStorage(() => localStorage), // 기본값 (sessionStorage도 가능)

      // 특정 필드만 저장하고 싶을 때 (partialize)
      partialize: (state) => ({ token: state.token }),
    },
  ),
);
```

> 브라우저를 새로고침해도 `token`이 localStorage에서 복원된다.

---

<br>

## Zustand + Immer 함께 쓰기 🍠

불변성 관리를 쉽게 하고 싶다면 Immer 미들웨어도 사용 가능하다.

```bash
npm install immer
```

```tsx
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type TodoStore = {
  todos: { id: number; text: string; done: boolean }[];
  addTodo: (text: string) => void;
  toggleTodo: (id: number) => void;
  removeTodo: (id: number) => void;
};

const useTodoStore = create<TodoStore>()(
  immer((set) => ({
    todos: [],

    addTodo: (text) =>
      set((state) => {
        // Immer 덕분에 직접 push 가능 (불변성 자동 처리)
        state.todos.push({ id: Date.now(), text, done: false });
      }),

    toggleTodo: (id) =>
      set((state) => {
        const todo = state.todos.find((t) => t.id === id);
        if (todo) todo.done = !todo.done; // 직접 수정 가능!
      }),

    removeTodo: (id) =>
      set((state) => {
        state.todos = state.todos.filter((t) => t.id !== id);
      }),
  })),
);
```

**Immer 없이 작성할 경우(비교):**

```tsx
// ❌ Immer 없이 toggleTodo → 스프레드 지옥
toggleTodo: (id) =>
  set((state) => ({
    todos: state.todos.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    ),
  })),
```

---

<br>

## Zustand vs Context API 🍠

| 항목                   | Context API                                | Zustand                                 |
| ---------------------- | ------------------------------------------ | --------------------------------------- |
| **설정 복잡도**        | Provider 래핑 필요                         | 설정 없이 바로 사용                     |
| **리렌더링**           | Context 값 변경 시 전체 하위 트리 리렌더링 | selector로 구독한 값만 변경 시 리렌더링 |
| **비동기 처리**        | 외부 라이브러리 필요                       | 스토어 내부에서 직접 처리 가능          |
| **미들웨어**           | 없음                                       | persist, immer, devtools 등 지원        |
| **컴포넌트 외부 접근** | 불가                                       | `useStore.getState()` 로 가능           |
| **번들 사이즈**        | 0KB (React 내장)                           | ~1KB                                    |
| **적합한 규모**        | 단순한 테마/언어 등                        | 중소규모 이상의 전역 상태               |

---

<br>
<br>

## React 전역 상태 관리 완벽 가이드 블로그 읽고 개념 정리하기 🍠

## Context API의 value 전체 구독 메커니즘과 Zustand의 selector 기반 구독의 성능 차이를 설명해보세요. 🍠

### Context API - value 전체 구독 메커니즘

Context API는 `구독-발행 패턴(Publish-Subscribe Pattern)`으로 동작하지만,
`user`나 `theme` 중 **하나만** 바뀌어도 `value` 객체가 새로 생성되고,
`useContext`를 사용하는 **모든** 컴포넌트가 재렌더링된다.

```tsx
function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");

  // user만 바뀌어도 value 객체가 새로 생성됨
  const value = { user, setUser, theme, setTheme };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// theme을 사용하지 않는데도 user가 바뀌면 재렌더링됨 ❌
function Parent() {
  const { user } = useContext(UserContext);
  return <div>{user?.name}</div>;
}

// user를 사용하지 않는데도 theme이 바뀌면 재렌더링됨 ❌
function Child() {
  const { theme } = useContext(UserContext);
  return <div>{theme}</div>;
}
```

**왜 이렇게 동작하냐면**, React의 Context는 **값 전체를 하나의 단위로 취급**하기 때문!
`value` 객체의 참조가 바뀌면, 그 안의 어떤 속성이 바뀌었는지 상관없이 모든 Consumer가 재평가된다.

### Zustand - selector 기반 구독

Zustand는 `useSyncExternalStore`를 활용해서, `selector(getState())`로 필요한 부분만 선택하고
`Object.is()`로 이전/현재 값을 비교해서 변경된 경우에만 재렌더링한다.

```tsx
// user 변경 시 내부 동작 흐름
// setState({ user: newUser })
// → listeners에게 알림
// → 각 컴포넌트의 useSyncExternalStore 실행
// → selector(getState()) 재계산
// → Object.is(newValue, oldValue) 비교
// → user 구독 컴포넌트만 재렌더링 ✅
// → theme 구독 컴포넌트는 변경 없으므로 무시 ✅

// user만 구독 → theme이 바뀌어도 재렌더링 안 됨
const user = useUserStore((state) => state.user);

// theme만 구독 → user가 바뀌어도 재렌더링 안 됨
const theme = useUserStore((state) => state.theme);
```

### 성능 차이 요약

| 항목           | Context API            | Zustand                |
| -------------- | ---------------------- | ---------------------- |
| 재렌더링 기준  | `value` 객체 참조 변경 | `selector` 반환값 변경 |
| 비교 단위      | value 전체             | selector가 반환한 값만 |
| 선택적 구독    | ❌ 불가                | ✅ 가능                |
| 내부 비교 방식 | 참조 비교 (===)        | Object.is()            |

> 커뮤니티 벤치마크 기준으로 50개 필드 폼에서 하나 변경 시
> Context API는 약 280ms, Zustand는 약 45ms로 약 **6배** 차이가 난다.

---

<br>

## Jotai의 atom 조합 방식이 파생 상태 관리에서 Zustand 대비 갖는 장점을 의존성 추적 관점에서 설명해보세요. 🍠

### Zustand의 파생 상태 방식

Zustand에서 파생 상태를 만들려면 selector를 직접 작성해야 한다.

```tsx
// 매번 selector에서 직접 계산해야 함
const filteredProducts = useStore((state) =>
  state.products.filter(
    (p) => p.category === state.filter && p.price >= state.minPrice,
  ),
);
```

`filter`가 바뀌든 `minPrice`가 바뀌든 `products`가 바뀌든 **매번 selector 전체가 재실행된다.**
의존성이 어디서 왔는지 Zustand는 추적하지 않기 때문!

### Jotai의 atom 조합 방식

Jotai는 **WeakMap 기반 Atom Store**와 **의존성 자동 추적**을 핵심으로 한다.
파생 atom 내부에서 `get(someAtom)`을 호출하는 순간 그 atom이 의존성으로 **자동 등록된다.**

```tsx
const productsAtom = atom([...])
const categoryFilterAtom = atom('전자기기')
const minPriceAtom = atom(0)

// get() 호출만으로 의존성이 자동 추적됨
const filteredProductsAtom = atom((get) => {
  const products = get(productsAtom)        // 의존성 등록 ✅
  const category = get(categoryFilterAtom)  // 의존성 등록 ✅
  const minPrice = get(minPriceAtom)        // 의존성 등록 ✅

  return products.filter(
    (p) => p.category === category && p.price >= minPrice
  )
})
```

의존성 그래프가 형성되어 `categoryFilterAtom`이 바뀌면 `filteredProductsAtom`이 자동으로 재계산되고,
이를 구독하는 컴포넌트만 재렌더링된다.

**의존성 그래프 구조:**

```tsx
productsAtom ──────────┐
categoryFilterAtom ────┼──> filteredProductsAtom ──> 구독 컴포넌트만 재렌더링
minPriceAtom ──────────┘
```

### 핵심 차이 - 의존성 추적 관점

| 항목              | Zustand                        | Jotai                        |
| ----------------- | ------------------------------ | ---------------------------- |
| 파생 상태 방식    | selector 직접 작성             | atom 조합 (자동 추적)        |
| 의존성 추적       | ❌ 없음, 매번 재계산           | ✅ get() 호출 시 자동 등록   |
| 연쇄 파생 (A→B→C) | 복잡해짐                       | 자연스럽게 가능              |
| 설계 방향         | Top-down (큰 store → selector) | Bottom-up (작은 atom → 조합) |

> **결론**: 파생 상태가 복잡하게 얽혀 있을수록 Jotai가 유리하다.
> Zustand는 "무엇이 변했는가"를 개발자가 직접 관리해야 하지만,
> Jotai는 `get()`만 호출하면 의존성이 자동으로 연결되어 변경 전파를 자동으로 처리해 준다.

---

<br>

## 서버 상태를 useEffect로 관리할 때 발생하는 캐싱/중복 요청/불일치 문제를 설명해보세요. 🍠

### 문제가 되는 코드

```tsx
function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  return loading ? <div>로딩 중...</div> : <ul>{/* ... */}</ul>;
}
```

### 문제 1 - 캐싱 없음

`useState`에 저장된 데이터는 컴포넌트가 unmount되면 그냥 사라진다.

```tsx
A 페이지 진입 → /api/products fetch → useState에 저장
B 페이지 이동 → 컴포넌트 unmount → 데이터 소실 😵
A 페이지 재진입 → 또 fetch → 또 로딩...
```

공유된 캐시 레이어가 없으니 같은 데이터를 반복 요청하는 낭비가 발생

### 문제 2 - 중복 요청

```tsx
// ProductList도 /api/products 요청
function ProductList() {
  useEffect(() => { fetch('/api/products')... }, [])
}

// CartSidebar도 /api/products 요청
function CartSidebar() {
  useEffect(() => { fetch('/api/products')... }, [])
}

// 동시에 마운트되면 완전히 동일한 API가 두 번 호출됨 😵
```

두 컴포넌트가 동시에 마운트되면 같은 엔드포인트에 요청이 중복 발생
공유된 캐시 레이어가 없기 때문!!

### 문제 3 - 서버/클라이언트 상태 불일치

```tsx
function LikeButton({ postId }) {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async () => {
    setIsLiked(true); // UI를 먼저 업데이트

    try {
      await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      // API는 성공했는데, 다른 사용자가 이미 취소한 상태라면?
      // 새로고침하면 서버 상태와 UI가 다름 😵
    } catch {
      setIsLiked(false);
    }
  };
}
```

`useState`는 클라이언트가 완전히 통제하는 상태이지만,
서버 상태는 **다른 사용자가 바꿀 수 있고**, **시간이 지나면 만료**되기 때문에
클라이언트가 갖고 있는 값이 서버의 실제 값과 달라질 수 있다.

### 세 가지 문제 정리

| 문제        | 원인                                | 증상                                 |
| ----------- | ----------------------------------- | ------------------------------------ |
| 캐싱 없음   | useState는 컴포넌트 생명주기에 종속 | 페이지 재방문 시 매번 다시 fetch     |
| 중복 요청   | 공유 캐시 레이어 부재               | 동일 API를 여러 컴포넌트가 각각 호출 |
| 상태 불일치 | 서버 상태는 클라이언트가 통제 불가  | 새로고침하면 UI와 실제 데이터가 다름 |

### 해결책 - TanStack Query

```tsx
// ✅ 캐싱 + 중복 제거 + 자동 동기화 모두 해결
const { data: products, isLoading } = useQuery({
  queryKey: ["products"],
  queryFn: () => fetch("/api/products").then((res) => res.json()),
});
```

- `queryKey`가 같으면 자동으로 캐시를 공유 → **중복 요청 제거**
- 컴포넌트가 unmount 되어도 캐시는 유지 → **캐싱 해결**
- `staleTime`, `refetchOnWindowFocus` 등으로 신선도 관리 → **불일치 해결**
