import emailjs from '@emailjs/browser';

const SERVICE_ID           = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const ADMIN_TEMPLATE_ID    = import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID;
const CUSTOMER_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_CUSTOMER_TEMPLATE_ID;
const PUBLIC_KEY           = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const ADMIN_EMAIL          = import.meta.env.VITE_ADMIN_EMAIL;

const isConfigured = () => SERVICE_ID && PUBLIC_KEY && ADMIN_TEMPLATE_ID && CUSTOMER_TEMPLATE_ID;

// ─── Formatters ───────────────────────────────────────────────────────────────

const formatItemsList = (items = []) =>
  items
    .map((i) => `- ${i.product_name}  x${i.quantity}  $${(i.price * i.quantity).toFixed(2)}`)
    .join('\n');

const formatShipping = (cost) => Number(cost) === 0 ? 'Free' : `$${Number(cost).toFixed(2)}`;
const formatCurrency  = (val) => `$${Number(val).toFixed(2)}`;

const formatDate = () => new Date().toLocaleDateString('en-GB', {
  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
});

const formatBudget = (val) => ({
  under_200:   'Under $200',
  '200_500':   '$200 - $500',
  '500_1000':  '$500 - $1,000',
  '1000_2000': '$1,000 - $2,000',
  over_2000:   'Over $2,000',
}[val] || val || 'Not specified');

const formatTimeline = (val) => ({
  flexible:  'Flexible',
  '1_month': 'Within 1 month',
  '2_months':'1 - 2 months',
  '3_months':'2 - 3 months',
  urgent:    'Urgent (special event)',
}[val] || val || 'Not specified');

// ─── Regular order emails ─────────────────────────────────────────────────────

export const sendAdminOrderNotification = async (order) => {
  if (!isConfigured()) return;
  try {
    await emailjs.send(SERVICE_ID, ADMIN_TEMPLATE_ID, {
      to_email:         String(ADMIN_EMAIL || ''),
      order_id:         String(order.id || '').slice(-8).toUpperCase(),
      customer_name:    String(order.customer_name || ''),
      customer_email:   String(order.customer_email || ''),
      customer_phone:   String(order.customer_phone || 'Not provided'),
      shipping_address: String(order.shipping_address || ''),
      order_notes:      String(order.notes || 'None'),
      items_list:       formatItemsList(order.items),
      subtotal:         formatCurrency(order.subtotal),
      shipping_cost:    formatShipping(order.shipping_cost),
      total:            formatCurrency(order.total),
      order_date:       formatDate(),
    }, PUBLIC_KEY);
  } catch (err) {
    console.error('Admin order email failed (non-fatal):', err);
  }
};

export const sendCustomerOrderConfirmation = async (order) => {
  if (!isConfigured()) return;
  try {
    await emailjs.send(SERVICE_ID, CUSTOMER_TEMPLATE_ID, {
      to_email:         String(order.customer_email || ''),
      to_name:          String(order.customer_name || ''),
      order_id:         String(order.id || '').slice(-8).toUpperCase(),
      items_list:       formatItemsList(order.items),
      subtotal:         formatCurrency(order.subtotal),
      shipping_cost:    formatShipping(order.shipping_cost),
      total:            formatCurrency(order.total),
      shipping_address: String(order.shipping_address || ''),
      order_date:       formatDate(),
    }, PUBLIC_KEY);
  } catch (err) {
    console.error('Customer order email failed (non-fatal):', err);
  }
};

export const sendOrderEmails = async (order) => {
  await Promise.all([
    sendAdminOrderNotification(order),
    sendCustomerOrderConfirmation(order),
  ]);
};

// ─── Custom order emails (reuse existing 2 templates) ────────────────────────
//
// Admin template variables mapped:
//   order_id         → request ID
//   items_list       → project title + description
//   subtotal         → budget
//   shipping_cost    → timeline
//   total            → "TBD - pending quote"
//   shipping_address → "Custom order request"
//   order_notes      → reference images count
//
// Customer template variables mapped:
//   order_id         → request ID
//   items_list       → project title + description
//   subtotal         → budget
//   shipping_cost    → timeline
//   total            → "TBD - pending quote"
//   shipping_address → "We will be in touch with a quote within 5-7 business days"

export const sendCustomOrderNotification = async (order) => {
  if (!isConfigured()) return;
  const imagesNote = order.reference_images?.length
    ? `${order.reference_images.length} image(s) uploaded`
    : 'No reference images';
  try {
    await emailjs.send(SERVICE_ID, ADMIN_TEMPLATE_ID, {
      to_email:         String(ADMIN_EMAIL || ''),
      order_id:         String(order.id || '').slice(-8).toUpperCase(),
      customer_name:    String(order.customer_name || ''),
      customer_email:   String(order.customer_email || ''),
      customer_phone:   String(order.customer_phone || 'Not provided'),
      shipping_address: 'Custom order request',
      order_notes:      `Reference images: ${imagesNote}`,
      items_list:       `${order.request_title}\n\n${order.request_description}`,
      subtotal:         formatBudget(order.budget),
      shipping_cost:    formatTimeline(order.timeline),
      total:            'TBD - pending quote',
      order_date:       formatDate(),
    }, PUBLIC_KEY);
  } catch (err) {
    console.error('Custom order admin email failed (non-fatal):', err);
  }
};

export const sendCustomOrderConfirmation = async (order) => {
  if (!isConfigured()) return;
  try {
    await emailjs.send(SERVICE_ID, CUSTOMER_TEMPLATE_ID, {
      to_email:         String(order.customer_email || ''),
      to_name:          String(order.customer_name || ''),
      order_id:         String(order.id || '').slice(-8).toUpperCase(),
      items_list:       `${order.request_title}\n\n${order.request_description}`,
      subtotal:         formatBudget(order.budget),
      shipping_cost:    formatTimeline(order.timeline),
      total:            'TBD - pending quote',
      shipping_address: 'We will be in touch with a quote within 5 to 7 business days',
      order_date:       formatDate(),
    }, PUBLIC_KEY);
  } catch (err) {
    console.error('Custom order confirm email failed (non-fatal):', err);
  }
};

export const sendCustomOrderEmails = async (order) => {
  await Promise.all([
    sendCustomOrderNotification(order),
    sendCustomOrderConfirmation(order),
  ]);
};