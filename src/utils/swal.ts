import Swal from 'sweetalert2';

// Базовый итальянский стиль для модалок
export const italianSwal = Swal.mixin({
  customClass: {
    popup: 'iswal-popup',
    title: 'iswal-title',
    htmlContainer: 'iswal-text',
    confirmButton: 'iswal-btn-confirm',
    cancelButton: 'iswal-btn-cancel',
    icon: 'iswal-icon',
    timerProgressBar: 'iswal-timer',
  },
  buttonsStyling: false,
  backdrop: 'rgba(26,26,26,0.45)',
});

// Тост для быстрых уведомлений (верхний правый угол)
export const italianToast = Swal.mixin({
  customClass: {
    popup: 'iswal-toast',
    title: 'iswal-toast-title',
    timerProgressBar: 'iswal-timer',
  },
  buttonsStyling: false,
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
});

// Готовые уведомления
export const notify = {
  success: (title: string, text?: string) =>
    italianToast.fire({ icon: 'success', title, text }),

  error: (title: string, text?: string) =>
    italianToast.fire({ icon: 'error', title, text }),

  warning: (title: string, text?: string) =>
    italianSwal.fire({ icon: 'warning', title, text, confirmButtonText: 'OK' }),

  confirm: (title: string, text?: string) =>
    italianSwal.fire({
      icon: 'warning', title, text,
      showCancelButton: true,
      confirmButtonText: 'Да',
      cancelButtonText: 'Отмена',
    }),

  welcome: (role?: string) =>
    italianToast.fire({
      icon: 'success',
      title: 'Benvenuto!',
      text: role === 'ADMIN' ? 'Добро пожаловать, amministratore' : 'Добро пожаловать в OLIMPIA',
    }),

  registered: () =>
    italianToast.fire({
      icon: 'success',
      title: 'Registrazione completata!',
      text: 'Аккаунт успешно создан',
    }),

  addedToCart: () =>
    italianToast.fire({
      icon: 'success',
      title: 'Aggiunto al carrello',
      text: 'Товар добавлен в корзину',
    }),

  orderCreated: () =>
    italianSwal.fire({
      icon: 'success',
      title: 'Ordine creato!',
      text: 'Ваш заказ успешно оформлен',
      confirmButtonText: 'Grazie',
    }),
};
