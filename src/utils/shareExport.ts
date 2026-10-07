/** Wait for the fixed export surface rather than capturing a loading portrait. */
export async function waitForExportAssets(node: HTMLElement) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      Promise.all([
        document.fonts.ready,
        ...Array.from(node.querySelectorAll('img')).map(async image => {
          await image.decode();
          if (!image.naturalWidth) throw new Error('Portrait unavailable');
        }),
      ]),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Card assets took too long to load')), 10000);
      }),
    ]);
    if (!node.isConnected) throw new Error('Share card was closed');
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
