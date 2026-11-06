declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

/**
 * Генерирует звуковой сигнал */

export const playBeepSignal = (
  frequency: number = 800,
  duration: number = 0.15,
): void => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx: AudioContext = new AudioContextClass();
    const osc: OscillatorNode = ctx.createOscillator();
    const gain: GainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);

    // Автоматически уничтожаем контекст после завершения проигрывания
    setTimeout(
      () => {
        ctx.close();
      },
      (duration + 0.1) * 1000,
    );
  } catch (e) {
    console.error("Не удалось воспроизвести аудио-сигнал:", e);
  }
};
