import { defineConfig } from 'vite';

export default defineConfig({
  // 절대경로 대신 상대경로 './' 로 변경하면 어떠한 이름의 깃허브 저장소에서든
  // 에셋(assets)의 404 오류 추적을 완벽하게 자동으로 맞춰줍니다.
  base: './',
});
