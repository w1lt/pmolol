declare module "use-debounce" {
  export function useDebouncedCallback<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    options?: {
      maxWait?: number;
      leading?: boolean;
      trailing?: boolean;
    }
  ): (...args: Parameters<T>) => ReturnType<T>;
}
