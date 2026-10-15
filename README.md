# 짱하연T의 국어 탐구소 🔎

미래엔(신유식) 국어 교과서로 1~3학년이 함께 탐구하는 수업 아카이브입니다.

**쓰는 기술**
- React 18 + Vite: 화면 전체
- Tailwind CSS: 파스텔 레트로 스타일 (`tailwind.config.js` 에 색과 그림자)
- framer-motion: 카드 등장, 탭 전환, 하트 애니메이션
- Vue 3: 푸터의 "개념 카드" 위젯 (`src/vue/TermCards.vue`, `src/components/VueIsland.jsx` 로 React 안에 띄움)
- Node.js(Express): 콘텐츠 서버 (`server/index.js`), 좋아요 수를 파일에 저장
- 글꼴: Jua(제목), Gowun Dodum(본문), Gaegu(손글씨)

## 실행하기
```bash
npm install
npm run dev      # 개발 화면 (http://localhost:5173)
npm run build    # dist/ 에 배포용 파일 생성 (서버 없이 정적 호스팅 가능)
npm start        # 빌드 후 Node 서버로 실행 (http://localhost:3001)
```
서버 없이 `dist/` 만 올려도 모든 화면이 동작합니다. 이때는 좋아요가 화면 안에서만 올라가요.
Node 서버로 실행하면 `content.json` 을 고친 뒤 새로고침만 해도 반영되고, 좋아요가 `server/likes.json` 에 남습니다.

## 내용 바꾸기: `src/data/content.json` 한 파일
- `grades[].semesters["1"|"2"]` : 학기별 1~4단원과 소단원
- 소단원의 `textbook`, `worksheet` 에 주소(구글 드라이브, 패들렛 등)를 넣으면 [교과서 자료] [활동지] 버튼이 새 탭으로 열립니다. 비워 두면 "준비 중" 안내가 떠요.
- **3학년 교과서가 나오면**: 3학년의 `"ready": false` 를 `true` 로 바꾸고, 각 단원의 `title`, `emoji`, `lessons` 를 1·2학년처럼 채우면 됩니다.
- `assessments` : 수행평가 게시물. `kind` 는 `"process"`(과정물) 또는 `"result"`(결과물). `image` 에 사진 주소를 넣으면 이모지 대신 사진이 보입니다. 지금 들어 있는 8개는 예시예요.
- `terms` : 개념 카드에 나오는 용어와 뜻

## 화면 구성
1. 학년 고르기: 1·2·3학년 카드. 누르면 그 학년의 단원 섹션으로 이동 (주소가 `#grade-2` 처럼 바뀌어 바로 공유 가능)
2. 단원 탐험: 학년·학기 탭, 1~4단원 카드. 단원을 누르면 소단원별 교과서 자료·활동지 버튼
3. 수행평가 전시관: 과정물/결과물, 학년 필터, 하트 응원
