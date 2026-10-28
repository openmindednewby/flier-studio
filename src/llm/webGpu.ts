interface GpuNavigator {
  gpu?: { requestAdapter: () => Promise<unknown> };
}

/** True only when the browser hands out a WebGPU adapter; `'gpu' in navigator` alone is not enough. */
export async function hasWebGpuAdapter(nav: GpuNavigator | undefined): Promise<boolean> {
  if (nav?.gpu === undefined) return false;
  try {
    return (await nav.gpu.requestAdapter()) !== null;
  } catch {
    return false;
  }
}
