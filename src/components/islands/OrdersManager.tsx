import React, { useEffect } from 'react';

export default function OrdersManager() {
  useEffect(() => {
    console.log('DOM cargado, configurando botones');
    
    // Agregar event listeners a los botones de actualizar estado
    document.querySelectorAll('.update-status-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const orderId = btn.getAttribute('data-order-id');
        const newStatus = btn.getAttribute('data-status');
        
        console.log('Actualizando pedido:', orderId, 'a estado:', newStatus);
        
        try {
          const response = await fetch('/api/admin/orders/update-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId, status: newStatus })
          });

          const responseData = await response.json();
          console.log('Respuesta del servidor:', responseData);

          if (!response.ok) {
            showErrorModal(responseData.error || 'Error al actualizar el pedido');
            return;
          }

          const statusText = newStatus === 'processing' ? 'procesamiento' : 
                            newStatus === 'completed' ? 'entregado' : 'pendiente';
          
          showSuccessModal(`Pedido marcado como ${statusText}`).then(() => {
            window.location.reload();
          });
        } catch (error) {
          showErrorModal('Error al actualizar el pedido');
          console.error('Error:', error);
        }
      });
    });

    console.log('Botones configurados:', document.querySelectorAll('.update-status-btn').length);
  }, []);

  return null;
}

function showSuccessModal(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    const modal = document.createElement('div');
    modal.className = 'bg-white rounded-lg p-8 max-w-md w-full shadow-xl';
    modal.innerHTML = `
      <div class="flex items-center justify-center mb-4">
        <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <h2 class="text-xl font-bold text-gray-900 mb-4 text-center">¡Éxito!</h2>
      <p class="text-gray-600 mb-6 text-center">${message}</p>
      <button id="close-btn" class="w-full px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition">
        Aceptar
      </button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    document.getElementById('close-btn').addEventListener('click', () => {
      overlay.remove();
      resolve(true);
    });
  });
}

function showErrorModal(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    const modal = document.createElement('div');
    modal.className = 'bg-white rounded-lg p-8 max-w-md w-full shadow-xl';
    modal.innerHTML = `
      <div class="flex items-center justify-center mb-4">
        <svg class="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </div>
      <h2 class="text-xl font-bold text-gray-900 mb-4 text-center">Error</h2>
      <p class="text-gray-600 mb-6 text-center">${message}</p>
      <button id="close-btn" class="w-full px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition">
        Aceptar
      </button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    document.getElementById('close-btn').addEventListener('click', () => {
      overlay.remove();
      resolve(true);
    });
  });
}
