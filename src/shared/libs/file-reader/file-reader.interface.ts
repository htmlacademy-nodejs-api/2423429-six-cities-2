import { EventEmitter } from 'node:events';

export interface FileReader extends EventEmitter {
  read(): Promise<void>;

  on(event: 'line', callback: (line: string, resolve: () => void) => void): this;
  on(event: 'end', callback: (count: number) => void): this;

  emit(event: 'line', line: string, resolve: () => void): boolean;
  emit(event: 'end', count: number): boolean;
}
