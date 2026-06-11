import {BACKEND_URL, SOCKET_URL} from '../src/config/env';

test('exports backend and socket urls from the env config', () => {
  expect(BACKEND_URL).toBe('https://eventboxserver.htdev.space/api');
  expect(SOCKET_URL).toBe('https://eventboxsocket.htdev.space');
});
