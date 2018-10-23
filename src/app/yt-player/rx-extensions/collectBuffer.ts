import { Observable, Subject } from 'rxjs';

export function collectBuffer<T>(items: T[]) {
  return (source: Observable<T>) => {
    const buffer = new Array<T>();
    const result = new Subject<T[]>();
    source.subscribe({
      next: (value: T) => {
        buffer.push(value);
        let check = true;
        for (const item of items) {
          check = check && buffer.indexOf(item) > -1;
        }
        if (check) {
          const output = [];
          for (const item of items) {
            const findIndex = buffer.indexOf(item);
            if (findIndex > -1) {
              output.push({ index: findIndex, value: item });
              buffer.splice(findIndex, 1);
            }
          }

          result.next(
            output.sort((a, b) => a.index - b.index).map(x => x.value)
          );
        }
      },
      error: (error: any) => {
        result.error(error);
      },
      complete: () => {
        result.complete();
      }
    });
    return result;
  };
}
