import Swal from 'sweetalert2';
import { BRAND } from '../config/brand';

const classes = {
  popup: 'swal-popup',
  title: 'swal-title',
  htmlContainer: 'swal-text',
  confirmButton: 'swal-confirm',
  cancelButton: 'swal-cancel',
};

const Modal = Swal.mixin({
  customClass: classes,
  buttonsStyling: false,
  backdrop: 'rgba(15,23,42,0.35)',
});

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3600,
  timerProgressBar: true,
  customClass: { popup: 'swal-toast', title: 'swal-title', htmlContainer: 'swal-text' },
  didOpen: (el) => {
    el.addEventListener('mouseenter', Swal.stopTimer);
    el.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

export const toastSuccess = (title, text) => Toast.fire({ icon: 'success', title, text });
export const toastError = (title, text) => Toast.fire({ icon: 'error', title, text });
export const toastWarning = (title, text) => Toast.fire({ icon: 'warning', title, text });
export const toastInfo = (title, text) => Toast.fire({ icon: 'info', title, text });

export const alertPipelineSuccess = (topic) =>
  Modal.fire({
    icon: 'success',
    title: 'Your Report is Ready',
    html: `${BRAND.name} Finished Researching <b>${escapeHtml(topic)}</b>. The report and the critic's review are waiting for you.`,
    confirmButtonText: 'View report',
  });

export const alertPipelineError = (message, onRetry) =>
  Modal.fire({
    icon: 'error',
    title: 'Research Failed',
    text: message || 'Something went wrong while the agents were working. Please try again.',
    showCancelButton: true,
    confirmButtonText: 'Try again',
    cancelButtonText: 'Dismiss',
  }).then((res) => {
    if (res.isConfirmed && onRetry) onRetry();
  });

function escapeHtml(str = '') {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}