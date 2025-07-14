import React from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { TrendingUp, Users, Package, DollarSign, AlertTriangle } from 'lucide-react';

export function Dashboard() {
  const { products, customers, sales, courses, serviceTickets } = useInventory();

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const lowStockProducts = products.filter(product => product.stock <= product.minStock);
  const totalCustomers = customers.length;
  const activeCourses = courses.filter(course => course.status === 'active').length;
  const activeServiceTickets = serviceTickets.filter(ticket => 
    ['received', 'diagnosed', 'in_progress'].includes(ticket.status)
  ).length;

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Products',
      value: products.length.toString(),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Customers',
      value: totalCustomers.toString(),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Active Services',
      value: activeServiceTickets.toString(),
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const recentSales = sales.slice(-5).reverse();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your inventory management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h3>
          </div>
          {lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">
                      {product.stock} remaining
                    </p>
                    <p className="text-xs text-gray-500">Min: {product.minStock}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">All products are well stocked</p>
          )}
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales</h3>
          {recentSales.length > 0 ? (
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Sale #{sale.id.slice(-6)}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">${sale.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 capitalize">{sale.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No sales recorded yet</p>
          )}
        </div>
      </div>
    </div>
  );
}