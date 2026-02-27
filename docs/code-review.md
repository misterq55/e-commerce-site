# 코드 리뷰 보고서

> 작성일: 2026-02-27

## 개요

E-commerce 풀스택 TypeScript 프로젝트 전체 코드 리뷰 결과입니다.
백엔드 9개 파일, 프론트엔드 12개 파일을 검토했습니다.

---

## 종합 요약

| 심각도 | 건수 |
|--------|------|
| 높음 (즉시 수정 필요) | 7건 |
| 중간 (우선순위 수정) | 13건 |
| 낮음 (개선 권장) | 10건 |
| **합계** | **30건** |

**전체 코드 품질 평가: 개선 필요 (Needs Improvement)**

---

## 심각도 높음 (Critical Issues)

### 1. LIKE 쿼리 와일드카드 미이스케이프
**파일:** `backend/src/routes/product.ts` (68-73행)

```typescript
query = query.where(
    'product.title LIKE :searchTerm OR product.description LIKE :searchTerm',
    { searchTerm: `%${searchTerm}%` }
)
```

**문제:** 사용자가 `%` 또는 `_` 문자를 입력하면 의도치 않은 쿼리가 실행됩니다. `%` 입력 시 전체 레코드가 반환됩니다.

**해결:** 입력값에서 LIKE 와일드카드 문자를 이스케이프 처리해야 합니다.

---

### 2. 파일 업로드 Path Traversal 취약점
**파일:** `backend/src/routes/product.ts` (22-24행)

```typescript
filename: function (_req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`)  // ❌
}
```

**문제:** `file.originalname`을 그대로 사용하면 `../../etc/passwd` 같은 경로 조작 공격이 가능합니다. 한글/특수문자 파일명도 오류를 유발합니다.

**해결:** `path.basename()`과 UUID 등 랜덤 문자열로 파일명을 생성해야 합니다.

---

### 3. 상품 생성 시 req.body 무검증
**파일:** `backend/src/routes/product.ts` (120-131행)

```typescript
const product = productRepository.create(req.body)  // ❌ req.body 그대로 사용
```

**문제:** 클라이언트가 `writer`, `sold`, `views` 등 내부 필드를 임의로 조작할 수 있습니다.

**해결:** `res.locals.user.id`를 서버에서 직접 `writer`에 설정하고, 허용 필드만 추출해야 합니다.

---

### 4. DB 비밀번호 하드코딩 및 환경변수 키 불일치
**파일:** `backend/src/data-source.ts` (11-15행)

```typescript
username: process.env.DB_USERNAME || 'admin',
password: process.env.DB_PASSWORD || 'admin123',  // ❌ 하드코딩
```

**문제:**
- 기본 비밀번호 `admin123`이 소스코드에 노출됩니다.
- CLAUDE.md의 환경변수 키(`POSTGRES_USER`, `POSTGRES_PASSWORD`)와 실제 코드(`DB_USERNAME`, `DB_PASSWORD`)가 불일치합니다.

**해결:** 기본값 제거, 환경변수 키 이름을 CLAUDE.md와 통일해야 합니다.

---

### 5. synchronize: true 환경 분기 없음
**파일:** `backend/src/data-source.ts` (16행)

```typescript
synchronize: true,  // ❌ 환경 분기 없음
```

**문제:** 프로덕션 배포 시 실수로 `true` 상태가 유지되면 스키마 변경으로 데이터가 손실될 수 있습니다.

**해결:**
```typescript
synchronize: process.env.NODE_ENV !== 'production'
```

---

### 6. JWT/쿠키 만료 시간 불일치
**파일:** `backend/src/routes/user.ts` (47-95행)

```typescript
// 회원가입: JWT 7일, 쿠키 7일 ✅
// 로그인:   JWT 7일, 쿠키 1시간 ❌
res.cookie('token', token, { maxAge: 60 * 60 * 1000 })  // 1시간
```

**문제:** 로그인 쿠키는 1시간 후 만료되지만 JWT는 7일간 유효해 일관성이 없습니다.

**해결:** 회원가입/로그인의 쿠키 만료 시간을 통일해야 합니다.

---

### 7. me 엔드포인트에서 비밀번호 포함 반환
**파일:** `backend/src/routes/user.ts` (10-12행)

```typescript
const me = async (req: Request, res: Response) => {
    return res.json(res.locals.user)  // ❌ 비밀번호 포함
}
```

**문제:** bcrypt 해시된 비밀번호도 클라이언트에 불필요하게 노출됩니다.

**해결:**
```typescript
const { password: _, ...userWithoutPassword } = res.locals.user
return res.json(userWithoutPassword)
```

---

## 심각도 중간 (Important Issues)

### 8. any 타입 남용
**파일:**
- `backend/src/routes/user.ts` (18, 38, 69행): `let errors: any = {}`
- `backend/src/middlewares/user.ts` (16행): `const decoded: any = jwt.verify(...)`
- `frontend/src/pages/UploadProductPage.tsx` (29, 37, 44행): `event: any`
- `frontend/src/pages/LandingPage.tsx` (78행): `event: any`
- `backend/src/entities/Payment.ts` (14행): `data!: any[]`

**문제:** CLAUDE.md에서 `any` 사용 금지를 명시했으나 광범위하게 사용됩니다.

---

### 9. Redux state 전체 localStorage 저장
**파일:** `frontend/src/store/store.ts` (10-15행)

**문제:** 사용자 이메일, 역할, 장바구니 정보 등이 localStorage에 평문으로 저장됩니다.

**해결:** `whitelist`/`blacklist`로 필요한 필드만 선택적으로 persist해야 합니다.

---

### 10. 장바구니 조회 URL에 ID 배열 직접 삽입
**파일:** `frontend/src/store/userSlice.ts` (122행)

```typescript
api.get(`/api/products/${body.cartItemIds}?type=array`)
// 결과: /api/products/1,2,3?type=array
```

**문제:** `NaN` 포함 또는 빈 배열 처리가 없고, 유효성 검사 없이 DB 쿼리에 전달됩니다.

---

### 11. JSON.parse try-catch 없음
**파일:** `backend/src/routes/product.ts` (77행)

```typescript
const parsedFilters = JSON.parse(filters)  // ❌ try-catch 없음
```

**문제:** 클라이언트가 유효하지 않은 JSON을 보내면 서버가 500 오류를 반환합니다.

---

### 12. QueryBuilder 재사용 패턴 위험
**파일:** `backend/src/routes/product.ts` (97-106행)

**문제:** `getCount()` 호출 후 동일한 `query` 객체에 `orderBy`를 추가합니다. TypeORM 버전에 따라 예상치 못한 동작을 할 수 있습니다.

---

### 13. 디버그 console.log 미제거
**파일:**
- `frontend/src/pages/CartPage.tsx` (10행)
- `frontend/src/pages/DetailProductPage.tsx` (20행)
- `frontend/src/components/common/FileUpload.tsx` (21행)

**문제:** 사용자 데이터가 브라우저 콘솔에 노출됩니다.

---

### 14. Product 엔티티에 불필요한 cart/history 필드
**파일:** `backend/src/entities/Product.ts` (33-37행)

```typescript
cart!: number[]     // ❌ User.cart에서 관리
history!: number[]  // ❌ 미사용
```

**문제:** CLAUDE.md 데이터 모델에 없는 필드로 설계 오류입니다.

---

### 15. Payment 엔티티 미완성
**파일:** `backend/src/entities/Payment.ts`

**문제:** 실제 결제 처리 로직이 없고 `data!: any[]`로 타입이 불명확합니다.

---

### 16. 장바구니 수량 무제한 증가
**파일:** `frontend/src/components/common/ProductInfo.tsx` (16-22행)

**문제:** 이미 장바구니에 있는 상품을 클릭하면 확인 없이 수량이 무제한으로 증가합니다.

---

### 17. register에서 new User() 사용 (컨벤션 위반)
**파일:** `backend/src/routes/user.ts` (32-35행)

```typescript
const user = new User()  // ❌ CLAUDE.md: repository.create() 사용 권장
```

---

### 18. 검색어 디바운스 미적용
**파일:** `frontend/src/pages/LandingPage.tsx` (78-89행)

**문제:** 키 입력마다 API가 호출됩니다. 300~500ms 디바운스 적용이 필요합니다.

---

### 19. NavBar 장바구니 뱃지 하드코딩
**파일:** `frontend/src/components/layout/NavBar.tsx` (12행)

```typescript
const cartItemCount = 3  // ❌ 임시 하드코딩
```

**문제:** 장바구니가 비어있어도 항상 "3"이 표시됩니다.

---

### 20. useEffect 의존성 배열 누락
**파일:** `frontend/src/pages/LandingPage.tsx` (21-23행)

```typescript
useEffect(() => {
    fetchProducts({ skip, limit })
}, [])  // ❌ skip, limit, fetchProducts 누락
```

---

## 심각도 낮음 (Suggestions)

### 21. calculateTotal 오타
**파일:** `frontend/src/pages/CartPage.tsx` (37행)
- `calulateTotal` → `calculateTotal`

### 22. map 대신 reduce 사용 권장
**파일:** `frontend/src/pages/CartPage.tsx` (39행)
- `map`으로 side effect 발생 → `reduce`로 변경 권장

### 23. 합계 금액 포맷 미적용
**파일:** `frontend/src/pages/CartPage.tsx` (57행)
- `{total}` → `{total.toLocaleString()}`

### 24. continents 데이터 중복 정의 및 오타
**파일:** `frontend/src/pages/UploadProductPage.tsx` (8-16행)
- `filterData.ts`와 중복 정의
- `Austrailia` → `Australia` 오타

### 25. PORT 미설정 시 처리 없음
**파일:** `backend/src/index.ts` (24행)
- `process.env.PORT` → `process.env.PORT || 3000`

### 26. filterData의 _id 네이밍 불일치
**파일:** `frontend/src/utils/filterData.ts`
- PostgreSQL 프로젝트에서 MongoDB 스타일 `_id` 사용 → `id`로 통일 권장

### 27. 이미지 없는 경우 처리 없음
**파일:** `frontend/src/components/common/ImageSlider.tsx`
- `images`가 빈 배열일 때 기본 이미지 또는 안내 UI 필요

### 28. 파일 삭제 시 서버 파일 미삭제
**파일:** `frontend/src/components/common/FileUpload.tsx` (29-34행)
- 클라이언트 상태만 제거, 서버 실제 파일은 남아 고아 파일 누적

### 29. ProtectedRoute에서 persist 수화 전 리다이렉트
**파일:** `frontend/src/components/ProtectedRoute.tsx` (12-14행)
- redux-persist rehydration 완료 전 `user`가 `null`이어서 로그인된 사용자도 로그인 페이지로 리다이렉트될 수 있음

### 30. 에러 응답 형식 불일치
**파일:** `backend/src/routes/user.ts`, `backend/src/routes/product.ts`
- `errors` 객체 직접 반환 / `{ email: ... }` / `{ message: ... }` / `{ error }` 등 형식이 혼재
- 일관된 에러 응답 스키마 정의 필요

---

## 잘된 점

- `middlewares/auth.ts`와 `middlewares/user.ts`의 책임 분리가 명확합니다.
- `store/store.ts`에서 redux-persist 직렬화 경고를 `ignoredActions`로 올바르게 처리했습니다.
- `components/common/Input.tsx`에서 `forwardRef`와 `displayName` 설정이 올바릅니다.
- `DetailProductPage.tsx`에서 Early return 패턴으로 타입 내로잉을 잘 구현했습니다.
- `UserInfo.tsx`에서 외부 클릭 감지 시 이벤트 리스너를 조건부로 추가/제거하여 메모리 누수를 방지했습니다.
- 전반적으로 `import type` 구문을 사용하여 CLAUDE.md 컨벤션을 준수했습니다.
- `AuthLayout.tsx`에서 이미 로그인된 사용자의 리다이렉트 처리가 올바릅니다.
- Multer에서 파일 크기 제한(5MB)과 MIME 타입 검사를 적용했습니다.

---

## 우선 조치 권장 순서

1. **(높음)** 파일 업로드 Path Traversal 취약점 수정
2. **(높음)** `createProduct`에서 `writer` 서버 측 설정
3. **(높음)** JWT/쿠키 만료 시간 통일
4. **(높음)** `data-source.ts` 환경변수 키 이름 통일
5. **(높음)** `synchronize` 환경 분기 처리
6. **(중간)** `me` 엔드포인트 비밀번호 제외 반환
7. **(중간)** NavBar 장바구니 뱃지 Redux state 연결
