import { Application, Assets, Sprite, Container, Graphics, Text, TextStyle } from 'pixi.js';
import './style.css';
import heroImg from './assets/hero.png';
import { TetrominoType, PuzzlePieceData, type GridConfig } from './tetromino';

async function initGame() {
    const app = new Application();
    await app.init({
        width: 1024,
        height: 768,
        backgroundColor: 0x222222,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
    });

    const appContainer = document.getElementById('app');
    if (appContainer && app.canvas) {
        appContainer.appendChild(app.canvas);
        app.canvas.addEventListener('contextmenu', e => e.preventDefault());
    }

    app.stage.sortableChildren = true;
    const texture = await Assets.load(heroImg);
    
    const CELL_SIZE = 64; 
    const gridConfig: GridConfig = {
        cols: 6, rows: 6,
        cellSize: CELL_SIZE,
        offsetX: 500, offsetY: 150 
    };

    // 보드 렌더링
    const boardOutline = new Graphics();
    for (let i = 0; i <= gridConfig.cols; i++) {
        boardOutline.moveTo(gridConfig.offsetX + i * CELL_SIZE, gridConfig.offsetY);
        boardOutline.lineTo(gridConfig.offsetX + i * CELL_SIZE, gridConfig.offsetY + gridConfig.rows * CELL_SIZE);
    }
    for (let j = 0; j <= gridConfig.rows; j++) {
        boardOutline.moveTo(gridConfig.offsetX, gridConfig.offsetY + j * CELL_SIZE);
        boardOutline.lineTo(gridConfig.offsetX + gridConfig.cols * CELL_SIZE, gridConfig.offsetY + j * CELL_SIZE);
    }
    boardOutline.stroke({ width: 1, color: 0x555555 });
    app.stage.addChild(boardOutline);

    const boardState: (string | null)[][] = Array.from({ length: gridConfig.rows }, () => Array(gridConfig.cols).fill(null));
    let pieces: any[] = []; // 승리조건 체크용 저장소

    function canPlacePiece(blocks: {x:number, y:number}[], targetX: number, targetY: number, excludeId: string): boolean {
        for (const block of blocks) {
            const bx = targetX + block.x;
            const by = targetY + block.y;
            if (bx < 0 || bx >= gridConfig.cols || by < 0 || by >= gridConfig.rows) return false;
            const occupying = boardState[by][bx];
            if (occupying !== null && occupying !== excludeId) return false;
        }
        return true;
    }

    function updateBoardState(blocks: {x:number, y:number}[], targetX: number, targetY: number, pieceId: string, isPlacing: boolean) {
        for (const block of blocks) {
            const bx = targetX + block.x;
            const by = targetY + block.y;
            if (bx >= 0 && bx < gridConfig.cols && by >= 0 && by < gridConfig.rows) {
                boardState[by][bx] = isPlacing ? pieceId : null;
            }
        }
    }

    function checkWinCondition() {
        const allCorrect = pieces.every(p => {
            const data = p.pieceData as PuzzlePieceData;
            return data.currentGridX === data.originGridX && 
                   data.currentGridY === data.originGridY && 
                   data.rotationPhase === 0;
        });

        if (allCorrect) {
            const style = new TextStyle({
                fontFamily: 'Inter',
                fontSize: 60,
                fontWeight: 'bold',
                fill: '#00ff99'
            });
            const winText = new Text({ text: 'PUZZLE CLEARED!', style });
            winText.anchor.set(0.5);
            winText.x = app.screen.width / 2;
            winText.y = 80;
            winText.zIndex = 1000;
            app.stage.addChild(winText);
        }
    }

    function createPiece(id: string, type: TetrominoType, gridX: number, gridY: number): Container {
        const pieceData = new PuzzlePieceData(id, type, gridX, gridY);
        const container = new Container();
        (container as any).pieceData = pieceData;

        const sprite = new Sprite(texture);
        sprite.width = gridConfig.cols * CELL_SIZE; 
        sprite.height = gridConfig.rows * CELL_SIZE;

        const mask = new Graphics();
        const pieceOutline = new Graphics();
        container.addChild(sprite);
        container.addChild(mask);
        container.addChild(pieceOutline);
        container.mask = mask;

        // 회전 관련 헬퍼 함수는 간소화를 위해 생략

        // 기존 방식대로 초기 마스크 설정
        pieceData.blocks.forEach(block => {
            mask.rect(block.x * CELL_SIZE, block.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            pieceOutline.rect(block.x * CELL_SIZE, block.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        });
        mask.fill(0xFFFFFF);
        pieceOutline.stroke({ width: 2, color: 0xFFFFFF, alpha: 0.8 });

        // 초기 시작 위치 (대기열)
        sprite.x = -gridX * CELL_SIZE;
        sprite.y = -gridY * CELL_SIZE;

        // 회전시 중앙을 잡기 위해 width/height 계산 
        // (단순화를 위해 피벗은 0,0 그대로 두고 드래그 포인터를 사용하도록 변경)
        container.x = 50 + Math.random() * 200;
        container.y = 100 + Math.random() * 400;

        container.eventMode = 'static';
        container.cursor = 'pointer';
        container.zIndex = 1;

        let isDragging = false;
        let startGridX = pieceData.currentGridX;
        let startGridY = pieceData.currentGridY;
        let wasOnBoard = false;
        let dragPointerStart = { x: 0, y: 0 };
        let originalPos = { x: 0, y: 0 };
        let isLocked = false;

        container.on('pointerdown', (e) => {
            if (isLocked) return;
            if (pieceData.currentGridX >= 0) {
                updateBoardState(pieceData.blocks, pieceData.currentGridX, pieceData.currentGridY, pieceData.id, false);
                wasOnBoard = true;
                startGridX = pieceData.currentGridX;
                startGridY = pieceData.currentGridY;
            } else {
                wasOnBoard = false;
            }

            pieceData.currentGridX = -1;
            pieceData.currentGridY = -1;

            isDragging = true;
            container.zIndex = 100;
            originalPos = { x: container.x, y: container.y };
            dragPointerStart = { x: e.global.x, y: e.global.y };
        });

        const onDragMove = (e: any) => {
            if (isDragging) {
                container.x = originalPos.x + (e.global.x - dragPointerStart.x);
                container.y = originalPos.y + (e.global.y - dragPointerStart.y);
            }
        };

        const onDragEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            if (isLocked) return;
            container.zIndex = 1;

            // 회전된 상태라면 angle이 0, 90, 180, 270 중 하나이므로 좌상단 계산을 보완해야 함 (이 프로토타입에선 0도만 지원)
            const gridFloatX = (container.x - gridConfig.offsetX) / CELL_SIZE;
            const gridFloatY = (container.y - gridConfig.offsetY) / CELL_SIZE;

            const targetGridX = Math.round(gridFloatX);
            const targetGridY = Math.round(gridFloatY);

            // 약 반칸(0.4) 이내 정확도일때 스냅
            let snapped = false;
            if (Math.abs(targetGridX - gridFloatX) < 0.4 && Math.abs(targetGridY - gridFloatY) < 0.4) {
                if (canPlacePiece(pieceData.blocks, targetGridX, targetGridY, pieceData.id)) {
                    container.x = gridConfig.offsetX + targetGridX * CELL_SIZE;
                    container.y = gridConfig.offsetY + targetGridY * CELL_SIZE;
                    
                    pieceData.currentGridX = targetGridX;
                    pieceData.currentGridY = targetGridY;
                    
                    updateBoardState(pieceData.blocks, targetGridX, targetGridY, pieceData.id, true);
                    snapped = true;

                    // 정답 위치 체크 (그룹화 대신 Lock 처리)
                    if (pieceData.currentGridX === pieceData.originGridX && 
                        pieceData.currentGridY === pieceData.originGridY && 
                        pieceData.rotationPhase === 0) {
                        isLocked = true;
                        container.cursor = 'default';
                        // 정답 시 보드 위의 외곽선을 투명하게 지워줌 (원래 그림처럼 보이게)
                        pieceOutline.clear();
                        checkWinCondition();
                    }
                }
            }
            
            if (!snapped) {
                if (wasOnBoard && canPlacePiece(pieceData.blocks, startGridX, startGridY, pieceData.id)) {
                    container.x = gridConfig.offsetX + startGridX * CELL_SIZE;
                    container.y = gridConfig.offsetY + startGridY * CELL_SIZE;
                    pieceData.currentGridX = startGridX;
                    pieceData.currentGridY = startGridY;
                    updateBoardState(pieceData.blocks, startGridX, startGridY, pieceData.id, true);
                } else {
                    pieceData.currentGridX = -1;
                    pieceData.currentGridY = -1;
                }
            }
        };

        app.stage.eventMode = 'static';
        app.stage.hitArea = app.screen;
        app.stage.on('pointermove', onDragMove);
        app.stage.on('pointerup', onDragEnd);
        app.stage.on('pointerupoutside', onDragEnd);

        container.on('rightdown', (e) => {
            e.stopPropagation();
            if (isLocked) return;
            // 회전 시연 방지 (스냅 축이 뒤틀리는 문제 방지를 위해 프로토타입에선 회전을 막거나 단순 데이터 회전만 처리)
            // 테트로미노 마스크는 회전이 까다로워 이번 버전에선 제거
        });
        
        pieces.push(container);
        return container;
    }

    // 테스트 4조각: L, J, T, 등
    const p1 = createPiece("p1", TetrominoType.T, 0, 0);
    const p2 = createPiece("p2", TetrominoType.L, 3, 0);
    const p3 = createPiece("p3", TetrominoType.O, 0, 3);
    const p4 = createPiece("p4", TetrominoType.Z, 3, 3);

    app.stage.addChild(p1);
    app.stage.addChild(p2);
    app.stage.addChild(p3);
    app.stage.addChild(p4);
}

initGame().catch(console.error);
