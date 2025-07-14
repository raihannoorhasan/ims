import React from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { TrendingUp, DollarSign, Package, ShoppingCart, Users, BookOpen } from 'lucide-react';

export function Reports() {
  const { products, customers, sales, courses, suppliers, serviceTickets } = useInventory();

  // Calculate analytics
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const serviceRevenue = serviceTickets
    .filter(ticket => ticket.status === 'completed')
    .reduce((sum, ticket) => sum + ticket.actualCost, 0);
  
  const totalProfit = sales.reduce((sum, sale) => {
    return sum + sale.items.reduce((itemSum, item) => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        return itemSum + ((item.unitPrice - product.buyingPrice) * item.quantity);
      }
      return itemSum;
    }, 0);
  }, 0);

  const totalInventoryValue = products.reduce((sum, product) => sum + (product.buyingPrice * product.stock), 0);
  const lowStockProducts = products.filter(product => product.stock <= product.minStock);
  const pendingServiceTickets = serviceTickets.filter(ticket => 
    ['received', 'diagnosed', 'waiting_approval', 'in_progress'].includes(ticket.status)
  );
  
  const topSellingProducts = products
    .map(product => ({
      ...product,
      totalSold: sales.reduce((sum, sale) => {
        const saleItem = sale.items.find(item => item.productId === product.id);
        return sum + (saleItem ? saleItem.quantity : 0);
      }, 0)
    }))
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);

  const salesByCategory = products.reduce((acc, product) => {
    const totalSold = sales.reduce((sum, sale) => {
      const saleItem = sale.items.find(item => item.productId === product.id);
      return sum + (saleItem ? saleItem.quantity : 0);
    }, 0);
    
    acc[product.category] = (acc[product.category] || 0) + totalSold;
    return acc;
  }, {} as Record<string, number>);

  const recentSales = sales.slice(-10).reverse();

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${(totalRevenue + serviceRevenue).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Profit',
      value: `$${totalProfit.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Inventory Value',
      value: `$${totalInventoryValue.toLocaleString()}`,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Service Revenue',
      value: `$${serviceRevenue.toLocaleString()}`,
      icon: ShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">Comprehensive business insights and performance metrics</p>
      </div>

      {/* Key Metrics */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Selling Products */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
          <div className="space-y-4">
            {topSellingProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{product.totalSold} sold</p>
                  <p className="text-sm text-gray-600">
                    ${(product.totalSold * product.sellingPrice).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
          <div className="space-y-4">
            {Object.entries(salesByCategory).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-900 capitalize">{category}</span>
                </div>
                <span className="text-gray-600">{count} units</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alert</h3>
          {lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
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

        {/* Business Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700">Total Products</span>
              </div>
              <span className="font-medium">{products.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Total Customers</span>
              </div>
              <span className="font-medium">{customers.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-purple-500" />
                <span className="text-gray-700">Active Courses</span>
              </div>
              <span className="font-medium">
                {courses.filter(c => c.status === 'active').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <span className="text-gray-700">Profit Margin</span>
              </div>
              <span className="font-medium">
                {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}