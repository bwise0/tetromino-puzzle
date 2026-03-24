# 테트로미노 이미지 퍼즐 개발 체크리스트

- [x] **1. 프로젝트 설정 및 에셋 관리**
  - [x] 현재 의존성(Dependencies) 확인 (PixiJS, Vite 설정)
  - [x] 기본 Vite 보일러플레이트 코드 삭제 ([main.ts](file:///c:/Users/bwise/Desktop/tetromino/tetromino-puzzle/src/main.ts), [style.css](file:///c:/Users/bwise/Desktop/tetromino/tetromino-puzzle/src/style.css))
  - [x] [index.html](file:///c:/Users/bwise/Desktop/tetromino/tetromino-puzzle/index.html)에 PixiJS Application 캔버스(Canvas) 설정
  - [x] 초기 테스트용 이미지 에셋(Assets) 로드

- [x] **2. 핵심 데이터 구조 설계**
  - [x] 그리드(Grid) 규칙 정의 (행, 열, 셀 크기)
  - [x] 테트로미노 기본 도형 정의 (I, J, L, O, S, T, 지그재그(S/Z), 십자가(T) 모양)
  - [x] 퍼즐 조각의 데이터 모델 구성 (좌표, 형태, 텍스처 경계 영역 등)

- [x] **3. 그래픽 및 렌더링 (Rendering)**
  - [x] 원본 이미지를 마스킹(Masking)하여 개별 퍼즐 조각 그래픽 생성
  - [x] 생성된 조각들을 화면(Canvas)에 렌더링
  - [x] (선택사항) 퍼즐을 맞출 목표 보드/그리드의 외곽선 렌더링

- [x] **4. 사용자 입력 및 상호작용 (Interaction)**
  - [x] 퍼즐 조각 드래그 앤 드롭(Drag and Drop) 기능 구현
  - [x] 조각 회전(Rotation) 기능 구현 잠정 처리 (드래그 축 안정화를 위해 기본 탑재)
  - [x] 깊이 정렬(Z-index sorting) 추가 (선택한 조각이 맨 앞으로 오도록 처리)

- [x] **5. 게임 로직 및 핵심 메커니즘**
  - [x] 조각을 놓을 때 가까운 그리드에 스내핑(Snapping)되도록 구현
  - [x] 최종 보드 위에서 다른 조각과 겹치지 않도록 충돌 방지(Collision) 로직 구현
  - [x] **올바른 위치 고정 로직:** 원래 위치(Origin)에 맞춰지면 조각이 고정되도록 하여 그룹화/완성 과정 대체

- [x] **6. 게임 상태 및 UI**
  - [x] 승리 조건(Win Condition) 판별 (모든 조각이 하나로 병합되어 원래 이미지가 완성된 상태)
  - [x] 기본 UI 추가 (승리 시 축하 메시지)

- [x] **7. 폴리싱 및 최적화**
  - [x] 애니메이션 효과 대안 - 스냅 시 빠른 위치 이동, 승리 시 UI 추가 연출
  - [x] 최종 스타일링 및 캔버스 중앙 정렬 처리
