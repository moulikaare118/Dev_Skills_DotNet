// TODO: Add client-side order form behavior for dynamic line items and live totals.
document.addEventListener('DOMContentLoaded', function () {
  const orderForm = document.querySelector('form[action="Create"]');
  if (!orderForm) {
    return;
  }

  orderForm.addEventListener('input', updateOrderTotal);
  orderForm.addEventListener('click', function (event) {
    if (event.target.matches('[data-add-line-item]')) {
      event.preventDefault();
      addLineItem();
    }
    if (event.target.matches('[data-remove-line-item]')) {
      event.preventDefault();
      removeLineItem(event.target.closest('.line-item'));
    }
  });

  updateOrderTotal();
});

function addLineItem() {
  const template = document.querySelector('.line-item-template');
  if (!template) {
    return;
  }

  const clone = template.cloneNode(true);
  clone.classList.remove('d-none', 'line-item-template');
  clone.classList.add('line-item');
  clone.querySelectorAll('input, select').forEach((input) => {
    input.value = '';
  });

  const container = document.querySelector('#order-line-items');
  container.appendChild(clone);
  updateOrderTotal();
}

function removeLineItem(row) {
  if (!row) {
    return;
  }

  row.remove();
  updateOrderTotal();
}

function updateLineTotal(quantity, unitPrice) {
  return Number(quantity) * Number(unitPrice) || 0;
}

function updateOrderTotal() {
  const rows = document.querySelectorAll('.line-item');
  let total = 0;

  rows.forEach((row) => {
    const quantity = row.querySelector('[name*="Quantity"]').value;
    const price = row.querySelector('[name*="UnitPrice"]').value;
    const lineTotalField = row.querySelector('.line-total');
    const lineTotal = updateLineTotal(quantity, price);

    if (lineTotalField) {
      lineTotalField.textContent = lineTotal.toFixed(2);
    }

    total += lineTotal;
  });

  const orderTotal = document.querySelector('#order-total');
  if (orderTotal) {
    orderTotal.textContent = total.toFixed(2);
  }
}
