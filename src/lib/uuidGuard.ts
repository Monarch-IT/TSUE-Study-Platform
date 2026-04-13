/**
 * UUID Guard — проверка валидности UUID перед отправкой в Supabase.
 * Предотвращает ошибку "invalid input syntax for type uuid" при использовании
 * локальных admin-сессий (например admin-local, TSUE-Monarch и т.д.)
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Проверить, является ли строка валидным UUID (формат v4) */
export const isValidUUID = (id: string | undefined | null): boolean => {
    if (!id) return false;
    return UUID_REGEX.test(id);
};

/** Проверить, является ли пользователь реальным (не локальным админом) */
export const isRealUser = (userId: string | undefined | null): boolean => {
    return isValidUUID(userId);
};
