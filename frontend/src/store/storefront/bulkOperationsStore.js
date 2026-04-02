import { create } from 'zustand'

const useBulkOperationsStore = create((set, get) => ({
  bulkTasks: [
    {
      id: 1,
      sellerId: 101,
      taskType: 'price_update',
      status: 'completed',
      targetItems: [101, 102, 103],
      operation: { action: 'update', field: 'price', value: 2500 },
      itemsProcessed: 3,
      totalItems: 3,
      createdDate: new Date(),
      completedDate: new Date(),
      errors: []
    }
  ],

  templates: [
    {
      id: 1,
      sellerId: 101,
      name: 'Seasonal Discount',
      description: 'Apply 30% discount to spring items',
      operation: { action: 'apply_discount', percentage: 30 },
      applicableProducts: [101, 102]
    }
  ],

  createBulkTask: (sellerId, taskType, items, operation) =>
    set((state) => ({
      bulkTasks: [
        ...state.bulkTasks,
        {
          id: Date.now(),
          sellerId,
          taskType,
          status: 'pending',
          targetItems: items,
          operation,
          itemsProcessed: 0,
          totalItems: items.length,
          createdDate: new Date(),
          completedDate: null,
          errors: []
        }
      ]
    })),

  executeBulkTask: (taskId) =>
    set((state) => ({
      bulkTasks: state.bulkTasks.map(t =>
        t.id === taskId
          ? {
            ...t,
            status: 'processing',
            itemsProcessed: t.targetItems.length,
            completedDate: new Date(),
            status: 'completed'
          }
          : t
      )
    })),

  updatePrices: (sellerId, itemIds, newPrice) =>
    set((state) => ({
      bulkTasks: [
        ...state.bulkTasks,
        {
          id: Date.now(),
          sellerId,
          taskType: 'price_update',
          status: 'completed',
          targetItems: itemIds,
          operation: { action: 'update', field: 'price', value: newPrice },
          itemsProcessed: itemIds.length,
          totalItems: itemIds.length,
          createdDate: new Date(),
          completedDate: new Date(),
          errors: []
        }
      ]
    })),

  applyBulkDiscount: (sellerId, itemIds, discountPercentage) =>
    set((state) => ({
      bulkTasks: [
        ...state.bulkTasks,
        {
          id: Date.now(),
          sellerId,
          taskType: 'discount_apply',
          status: 'completed',
          targetItems: itemIds,
          operation: { action: 'apply_discount', percentage: discountPercentage },
          itemsProcessed: itemIds.length,
          totalItems: itemIds.length,
          createdDate: new Date(),
          completedDate: new Date(),
          errors: []
        }
      ]
    })),

  bulkDeleteItems: (sellerId, itemIds) =>
    set((state) => ({
      bulkTasks: [
        ...state.bulkTasks,
        {
          id: Date.now(),
          sellerId,
          taskType: 'delete_items',
          status: 'completed',
          targetItems: itemIds,
          operation: { action: 'delete' },
          itemsProcessed: itemIds.length,
          totalItems: itemIds.length,
          createdDate: new Date(),
          completedDate: new Date(),
          errors: []
        }
      ]
    })),

  bulkUpdateCategory: (sellerId, itemIds, newCategory) =>
    set((state) => ({
      bulkTasks: [
        ...state.bulkTasks,
        {
          id: Date.now(),
          sellerId,
          taskType: 'category_update',
          status: 'completed',
          targetItems: itemIds,
          operation: { action: 'update', field: 'category', value: newCategory },
          itemsProcessed: itemIds.length,
          totalItems: itemIds.length,
          createdDate: new Date(),
          completedDate: new Date(),
          errors: []
        }
      ]
    })),

  getTaskHistory: (sellerId) =>
    get().bulkTasks.filter(t => t.sellerId === sellerId),

  createTemplate: (sellerId, name, description, operation, products) =>
    set((state) => ({
      templates: [
        ...state.templates,
        {
          id: Date.now(),
          sellerId,
          name,
          description,
          operation,
          applicableProducts: products
        }
      ]
    })),

  applyTemplate: (templateId, itemIds) => {
    const template = get().templates.find(t => t.id === templateId)
    if (!template) return false
    // Execute template operation
    return true
  }
}))

export default useBulkOperationsStore
