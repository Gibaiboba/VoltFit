import { useEffect, useRef } from "react";

interface UseIntersectionObserverProps {
  onIntersect: () => void; // Что делать при появлении элемента (вызывать fetchNextPage)
  enabled?: boolean; // Активен ли поиск (например, есть ли вообще следующая страница)
}

export function useIntersectionObserver({
  onIntersect,
  enabled = true,
}: UseIntersectionObserverProps) {
  // Храним ссылку на невидимый элемент-маяк внизу страницы
  const targetRef = useRef<HTMLDivElement | null>(null);

  // Обернули колбэк, чтобы избежать лишних пересозданий подписки
  const savedOnIntersect = useRef(onIntersect);
  useEffect(() => {
    savedOnIntersect.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    // Если дозагрузка отключена или элемента нет на экране — ничего не делаем
    if (!enabled || !targetRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Если элемент-маяк стал виден хотя бы частично
          if (entry.isIntersecting) {
            savedOnIntersect.current();
          }
        });
      },
      {
        root: null, // Следим относительно области видимости браузера (viewport)
        rootMargin: "200px", // Начинаем загрузку за 200px ДО того, как пользователь доскроллит до конца (для бесшовности)
        threshold: 0.1,
      },
    );

    const currentTarget = targetRef.current;
    observer.observe(currentTarget);

    // Чистим за собой подписку при размонтировании компонента
    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [enabled]);

  return targetRef;
}
