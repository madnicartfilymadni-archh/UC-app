import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  Order,
  OrderStatus,
  PaymentSubmission,
  SiteSettings,
  UCProduct,
  AuditLog,
} from '../types';
import { DEFAULT_SITE_SETTINGS, INITIAL_PRODUCTS } from './constants';

const PRODUCTS_COL = 'products';
const ORDERS_COL = 'orders';
const SUBMISSIONS_COL = 'paymentSubmissions';
const SETTINGS_COL = 'siteSettings';
const AUDIT_COL = 'auditLogs';

// Unique Order ID generator
export function generateOrderNumber(): string {
  const prefix = 'VX';
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${randomPart}`;
}

// ---------------- PRODUCTS ----------------
export async function getProducts(): Promise<UCProduct[]> {
  try {
    const snap = await getDocs(collection(db, PRODUCTS_COL));
    if (snap.empty) {
      // Return initial defaults in memory if db not seeded yet
      return INITIAL_PRODUCTS;
    }
    const list: UCProduct[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...(d.data() as Omit<UCProduct, 'id'>) });
    });
    return list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, PRODUCTS_COL);
  }
}

export async function saveProduct(product: UCProduct): Promise<void> {
  const docRef = doc(db, PRODUCTS_COL, product.id);
  try {
    await setDoc(docRef, {
      ...product,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${PRODUCTS_COL}/${product.id}`);
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  const docRef = doc(db, PRODUCTS_COL, productId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${PRODUCTS_COL}/${productId}`);
  }
}

export async function seedProductsIfEmpty(): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, PRODUCTS_COL));
    if (snap.empty) {
      for (const item of INITIAL_PRODUCTS) {
        await setDoc(doc(db, PRODUCTS_COL, item.id), {
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Could not auto-seed products:', err);
    return false;
  }
}

// ---------------- ORDERS ----------------
export async function createOrder(
  data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Order> {
  const id = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const orderObj: Order = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, ORDERS_COL, id), orderObj);
    return orderObj;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${ORDERS_COL}/${id}`);
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const snap = await getDoc(doc(db, ORDERS_COL, orderId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<Order, 'id'>) };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${ORDERS_COL}/${orderId}`);
  }
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const cleanNumber = orderNumber.trim().toUpperCase();
  try {
    const q = query(collection(db, ORDERS_COL), where('orderNumber', '==', cleanNumber), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docData = snap.docs[0];
    return { id: docData.id, ...(docData.data() as Omit<Order, 'id'>) };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${ORDERS_COL}?orderNumber=${cleanNumber}`);
  }
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const snap = await getDocs(collection(db, ORDERS_COL));
    const orders: Order[] = [];
    snap.forEach((d) => {
      orders.push({ id: d.id, ...(d.data() as Omit<Order, 'id'>) });
    });
    // Sort descending by creation date
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn('getAllOrders error, returning empty list:', error);
    return [];
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  options?: {
    adminNote?: string;
    rejectionReason?: string;
    deliveredBy?: string;
  }
): Promise<void> {
  const docRef = doc(db, ORDERS_COL, orderId);
  const now = new Date().toISOString();
  const updateData: Record<string, any> = {
    status,
    updatedAt: now,
  };

  if (options?.adminNote !== undefined) updateData.adminNote = options.adminNote;
  if (options?.rejectionReason !== undefined) updateData.rejectionReason = options.rejectionReason;
  if (status === 'Delivered') {
    updateData.deliveryConfirmedAt = now;
    if (options?.deliveredBy) updateData.deliveredBy = options.deliveredBy;
  }

  try {
    await updateDoc(docRef, updateData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COL}/${orderId}`);
  }
}

// ---------------- MANUAL PAYMENT SUBMISSIONS ----------------
export async function createPaymentSubmission(
  data: Omit<PaymentSubmission, 'id' | 'createdAt' | 'updatedAt'>
): Promise<PaymentSubmission> {
  const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const submissionObj: PaymentSubmission = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, SUBMISSIONS_COL, id), submissionObj);
    return submissionObj;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${SUBMISSIONS_COL}/${id}`);
  }
}

export async function getAllSubmissions(): Promise<PaymentSubmission[]> {
  try {
    const snap = await getDocs(collection(db, SUBMISSIONS_COL));
    const list: PaymentSubmission[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...(d.data() as Omit<PaymentSubmission, 'id'>) });
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn('getAllSubmissions error, returning empty list:', error);
    return [];
  }
}

export async function checkDuplicateTransaction(
  transactionId: string,
  excludeSubmissionId?: string
): Promise<boolean> {
  try {
    const q = query(
      collection(db, SUBMISSIONS_COL),
      where('transactionId', '==', transactionId.trim()),
      where('status', '==', 'approved')
    );
    const snap = await getDocs(q);
    if (snap.empty) return false;
    if (excludeSubmissionId) {
      return snap.docs.some((d) => d.id !== excludeSubmissionId);
    }
    return true;
  } catch (err) {
    console.warn('Error checking duplicate transaction', err);
    return false;
  }
}

export async function reviewPaymentSubmission(
  submissionId: string,
  orderId: string,
  approved: boolean,
  reviewerEmail: string,
  rejectionReason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const subRef = doc(db, SUBMISSIONS_COL, submissionId);
    const subSnap = await getDoc(subRef);
    if (!subSnap.exists()) return { success: false, error: 'Submission not found' };

    const subData = subSnap.data() as PaymentSubmission;

    if (approved) {
      // Check duplicate reference rule
      const isDuplicate = await checkDuplicateTransaction(subData.transactionId, submissionId);
      if (isDuplicate) {
        return {
          success: false,
          error: `Transaction Reference "${subData.transactionId}" has ALREADY been approved for another order. Re-use prohibited.`,
        };
      }
    }

    const now = new Date().toISOString();
    await updateDoc(subRef, {
      status: approved ? 'approved' : 'rejected',
      verifiedBy: reviewerEmail,
      verifiedAt: now,
      rejectionReason: rejectionReason || null,
      updatedAt: now,
    });

    // Update corresponding order status
    await updateOrderStatus(orderId, approved ? 'Payment Confirmed' : 'Rejected', {
      adminNote: approved
        ? `Manual payment approved by ${reviewerEmail}. Ref: ${subData.transactionId}`
        : `Manual payment rejected: ${rejectionReason || 'Invalid payment receipt'}`,
      rejectionReason: approved ? undefined : rejectionReason,
    });

    return { success: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${SUBMISSIONS_COL}/${submissionId}`);
  }
}

// ---------------- SITE SETTINGS ----------------
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const snap = await getDoc(doc(db, SETTINGS_COL, 'general'));
    if (!snap.exists()) {
      return DEFAULT_SITE_SETTINGS;
    }
    return { ...DEFAULT_SITE_SETTINGS, ...(snap.data() as SiteSettings) };
  } catch (error) {
    console.warn('Using default settings fallback:', error);
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function saveSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  const docRef = doc(db, SETTINGS_COL, 'general');
  try {
    await setDoc(
      docRef,
      {
        ...settings,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COL}/general`);
  }
}

// ---------------- AUDIT LOGS ----------------
export async function addAuditLog(
  action: string,
  performedBy: string,
  details: string,
  orderNumber?: string
): Promise<void> {
  const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  try {
    await setDoc(doc(db, AUDIT_COL, id), {
      action,
      performedBy,
      orderNumber: orderNumber || null,
      details,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Failed to record audit log:', err);
  }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const snap = await getDocs(collection(db, AUDIT_COL));
    const logs: AuditLog[] = [];
    snap.forEach((d) => {
      logs.push({ id: d.id, ...(d.data() as Omit<AuditLog, 'id'>) });
    });
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (err) {
    console.warn('Failed to retrieve audit logs:', err);
    return [];
  }
}
