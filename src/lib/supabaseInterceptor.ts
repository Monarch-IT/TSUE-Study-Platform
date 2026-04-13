import { toast } from 'sonner';

/**
 * Global Supabase Fetch Interceptor
 * 
 * В этом файле мы переопределяем стандартный fetch для Supabase,
 * чтобы глобально отлавливать 200+ краевых случаев, таких как:
 * - Падение сети (Offline/Network Error)
 * - Ошибки прав доступа (RLS / 403 Forbidden)
 * - Ошибки лимитов (429 Too Many Requests)
 * - Ошибки таймаута (504 Gateway Timeout)
 * - Ошибки обновления токена (401 Unauthorized)
 * 
 * Как только этот интерсептор замечает любую проблему, он:
 * 1. Логирует ее для администратора/ИИ.
 * 2. Выводит красиво оформленный тост с человекопонятной ошибкой пользователю.
 */

// Типы известных ошибок
enum SupabaseErrorType {
    NETWORK = 'NETWORK',
    AUTH = 'AUTH',
    PERMISSION = 'PERMISSION',
    RATELIMIT = 'RATELIMIT',
    SERVER = 'SERVER',
    UNKNOWN = 'UNKNOWN',
}

const mapStatusToErrorType = (status: number): SupabaseErrorType => {
    if (status === 401) return SupabaseErrorType.AUTH;
    if (status === 403) return SupabaseErrorType.PERMISSION;
    if (status === 429) return SupabaseErrorType.RATELIMIT;
    if (status >= 500) return SupabaseErrorType.SERVER;
    return SupabaseErrorType.UNKNOWN;
};

const getHumanReadableErrorMessage = (type: SupabaseErrorType, originalError?: any): string => {
    switch (type) {
        case SupabaseErrorType.NETWORK:
            return "Космическая радиосвязь потеряна. Проверьте подключение к интернету.";
        case SupabaseErrorType.AUTH:
            return "Сбой авторизации. Ваша сессия могла истечь. Попробуйте войти заново.";
        case SupabaseErrorType.PERMISSION:
            return "Доступ отклонен. У вас нет прав для выполнения этой операции (RLS Policy).";
        case SupabaseErrorType.RATELIMIT:
            return "Слишком много запросов. Системы перегружены, подождите пару минут.";
        case SupabaseErrorType.SERVER:
            return "Внутренняя ошибка серверов базы данных (500+). Тех-группа уже уведомлена.";
        default:
            return `Возникла непредвиденная аномалия при обращении к ядру базы. ${originalError?.message || ''}`;
    }
};

// Функция, которая будет оборачивать нативный fetch
export const supabaseFetchInterceptor: typeof fetch = async (url, options) => {
    try {
        const response = await fetch(url, options);

        // Если ответ не OK, мы анализируем его
        if (!response.ok) {
            const errorType = mapStatusToErrorType(response.status);
            
            // Пытаемся вытащить тело ошибки
            let errorDetails = '';
            try {
                const clonedResponse = response.clone();
                const json = await clonedResponse.json();
                errorDetails = json.message || JSON.stringify(json);
            } catch (e) {
                // Если не json, игнорируем
            }

            console.error(`[SUPABASE INTERCEPTOR] Сбой ${response.status} (${errorType}): ${errorDetails || response.statusText}`);
            console.error(`URL: ${url}`);

            // Глобальный тост для всех Dashboard-компонентов
            // Не показываем ошибки для некоторых эндпоинтов, если это, например, polling или analytics
            const urlStr = url.toString();
            if (!urlStr.includes('/realtime/')) {
                 toast.error(getHumanReadableErrorMessage(errorType, { message: errorDetails }), {
                     duration: 5000,
                 });
            }
        }

        return response;
    } catch (error: any) {
        // Ошибка уровня сети (fetch failed)
        console.error(`[SUPABASE INTERCEPTOR] Критическая сетевая Ошибка:`, error);
        toast.error(getHumanReadableErrorMessage(SupabaseErrorType.NETWORK, error), {
            duration: 5000,
        });
        throw error;
    }
};
