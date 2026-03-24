export type GridPoint = { x: number; y: number };

export const TetrominoType = {
    I: 'I',
    J: 'J',
    L: 'L',
    O: 'O',
    S: 'S',
    T: 'T',
    Z: 'Z'
} as const;

export type TetrominoType = typeof TetrominoType[keyof typeof TetrominoType];

// 각 테트로미노의 블록 위치 (0,0을 기준으로 상대 좌표)
export const TETROMINO_SHAPES: Record<TetrominoType, GridPoint[]> = {
    [TetrominoType.I]: [{x:0, y:0}, {x:1, y:0}, {x:2, y:0}, {x:3, y:0}],
    [TetrominoType.J]: [{x:0, y:0}, {x:0, y:1}, {x:1, y:1}, {x:2, y:1}],
    [TetrominoType.L]: [{x:2, y:0}, {x:0, y:1}, {x:1, y:1}, {x:2, y:1}],
    [TetrominoType.O]: [{x:0, y:0}, {x:1, y:0}, {x:0, y:1}, {x:1, y:1}],
    [TetrominoType.S]: [{x:1, y:0}, {x:2, y:0}, {x:0, y:1}, {x:1, y:1}],
    [TetrominoType.T]: [{x:1, y:0}, {x:0, y:1}, {x:1, y:1}, {x:2, y:1}],
    [TetrominoType.Z]: [{x:0, y:0}, {x:1, y:0}, {x:1, y:1}, {x:2, y:1}],
};

export interface GridConfig {
    cols: number;           // 전체 그리드 열(가로 칸) 수
    rows: number;           // 전체 그리드 행(세로 칸) 수
    cellSize: number;       // 한 칸의 픽셀 크기
    offsetX: number;        // 보드 시작 X 좌표 (화면 렌더링용)
    offsetY: number;        // 보드 시작 Y 좌표
}

// 개별 퍼즐 조각 (하나의 테트로미노 형태)의 데이터 모델
export class PuzzlePieceData {
    public id: string;
    public type: TetrominoType;
    public blocks: GridPoint[];       // 조각을 구성하는 상대 좌표 블록들
    // 정답(목표) 보드에서의 원래 좌상단(origin) 위치 (그리드 좌표)
    public originGridX: number;
    public originGridY: number;

    // 현재 게임 상의 위치 (픽셀 단위 좌표 또는 현재 스냅된 그리드 좌표)
    public currentGridX: number;
    public currentGridY: number;

    // 회전 상태 (0, 90, 180, 270)
    public rotationPhase: number = 0; 

    // 그룹화된 조각들의 ID 목록 (나중에 합쳐질 때 사용)
    public mergedWith: string[] = []; 

    constructor(id: string, type: TetrominoType, originGridX: number, originGridY: number) {
        this.id = id;
        this.type = type;
        // 깊은 복사(deep copy)로 안전하게 가져옴
        this.blocks = TETROMINO_SHAPES[type].map(pt => ({ ...pt }));
        this.originGridX = originGridX;
        this.originGridY = originGridY;
        
        // 처음엔 랜덤하게 배치되겠지만 기준값으로 원본 좌표 할당
        this.currentGridX = originGridX;
        this.currentGridY = originGridY;
    }

    /**
     * 시계 방향으로 90도 회전
     */
    rotateCW(): void {
        this.rotationPhase = (this.rotationPhase + 90) % 360;
        // (x,y) -> (-y, x) 회전 공식을 변형하여 상대 좌표 갱신 (보통 y가 아래로 증가하므로 (x,y)->(-y,x) 주의)
        // 화면 좌표계 (y가 아래로 증가)에서의 시계방향 90도 회전: 새 x = 원본 -y, 새 y = 원본 x
        this.blocks = this.blocks.map(pt => ({
            x: -pt.y,
            y: pt.x
        }));
    }
}
