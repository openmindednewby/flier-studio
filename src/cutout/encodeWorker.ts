import { encodeCutout, type CutResult } from '@dloizides/background-removal';

type EncodeRequest = Pick<CutResult, 'image' | 'mask'>;
const scope = self as unknown as { onmessage: ((event: MessageEvent<EncodeRequest>) => void) | null; postMessage(png: Blob): void };

scope.onmessage = (event) => { void encodeCutout(event.data.image, event.data.mask).then((png) => scope.postMessage(png)); };
