import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { formatDate, formatPrice } from '../utils/formatters';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// TODO API: Este componente recibirá datos de GET /api/products/{id}/price-history
// o GET /api/components/{id}/price-history
// Estructura esperada: [{ date: string, price: number, storeName?: string, storeLogo?: string }]
function PriceChart({ priceHistory, storeName }) {
  // Preparar datos para el gráfico
  const labels = priceHistory.map(item => formatDate(item.date));
  const prices = priceHistory.map(item => item.price);

  const data = {
    labels: labels,
    datasets: [
      {
        label: `Precio en ${storeName}`,
        data: prices,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context) {
            let label = formatPrice(context.parsed.y);
            
            // Si hay información de tienda en los datos, mostrarla
            const dataPoint = priceHistory[context.dataIndex];
            if (dataPoint.storeName) {
              label += ` - ${dataPoint.storeLogo || ''} ${dataPoint.storeName}`;
            }
            
            return label;
          },
          title: function(context) {
            return context[0].label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return 'S/ ' + value.toLocaleString('es-PE');
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <div className="h-[120px] w-full">
      <Line data={data} options={options} />
    </div>
  );
}

export default PriceChart;
