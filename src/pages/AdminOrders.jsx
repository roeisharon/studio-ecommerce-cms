import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  ArrowLeft, Search, Eye, Package, Mail, Phone,
  MapPin, Sparkles, Image as ImageIcon,
} from 'lucide-react';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Badge }    from '@/components/ui/badge';
import { Label }    from '@/components/ui/label';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Sheet, SheetContent, SheetDescription,
  SheetHeader, SheetTitle,
} from '@/components/ui/sheet';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-800',
  confirmed:  'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped:    'bg-indigo-100 text-indigo-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
  quoted:     'bg-cyan-100 text-cyan-800',
};

const REGULAR_STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled'];
const CUSTOM_STATUSES  = ['pending','quoted','confirmed','processing','delivered','cancelled'];

const BUDGET_LABELS = {
  under_200: 'Under $200', '200_500': '$200–$500',
  '500_1000': '$500–$1,000', '1000_2000': '$1,000–$2,000', over_2000: 'Over $2,000',
};

const TIMELINE_LABELS = {
  flexible: 'Flexible', '1_month': 'Within 1 month',
  '2_months': '1–2 months', '3_months': '2–3 months', urgent: 'Urgent',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [search, setSearch]             = useState('');
  const [typeFilter, setTypeFilter]     = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected]         = useState(null); // { order, isCustom }
  const [lightbox, setLightbox]         = useState(null); // image url

  // Fetch both collections in parallel
  const { data: regularOrders = [], isLoading: loadingRegular } = useQuery({
    queryKey: ['admin-orders'],
    queryFn:  () => api.entities.Order.list('-created_date', 200),
  });

  const { data: customOrders = [], isLoading: loadingCustom } = useQuery({
    queryKey: ['admin-custom-orders'],
    queryFn:  () => api.entities.PersonalOrder.list('-created_date', 200),
  });

  const isLoading = loadingRegular || loadingCustom;

  // Merge — tag each row with its type
  const allOrders = [
    ...regularOrders.map(o => ({ ...o, _type: 'regular' })),
    ...customOrders.map(o  => ({ ...o, _type: 'custom'  })),
  ].sort((a, b) => {
    const da = a.created_date ? new Date(a.created_date) : 0;
    const db = b.created_date ? new Date(b.created_date) : 0;
    return db - da;
  });

  const filtered = allOrders.filter(o => {
    const q = search.toLowerCase();
    const matchSearch =
      o.customer_name?.toLowerCase().includes(q) ||
      o.customer_email?.toLowerCase().includes(q);
    const matchType   = typeFilter   === 'all' || o._type === typeFilter;
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const updateStatus = async (order, newStatus) => {
    const entity = order._type === 'custom'
      ? api.entities.PersonalOrder
      : api.entities.Order;
    await entity.update(order.id, { status: newStatus });
    queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    queryClient.invalidateQueries({ queryKey: ['admin-custom-orders'] });
    if (selected?.order.id === order.id) {
      setSelected({ ...selected, order: { ...selected.order, status: newStatus } });
    }
  };

  const updateTracking = async (orderId, trackingNumber) => {
    await api.entities.Order.update(orderId, { tracking_number: trackingNumber });
    queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
  };

  const statLabel = (s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="pt-28 pb-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('AdminDashboard')}
            className="inline-flex items-center text-[#5A5A5A] hover:text-[#C4785A] mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />Back to Dashboard
          </Link>
          <h1 className="text-3xl font-serif text-[#2D2D2D]">Orders</h1>
          <p className="text-[#5A5A5A] mt-1">
            {regularOrders.length} regular · {customOrders.length} custom
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search by name or email..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-none" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-44 rounded-none">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-44 rounded-none">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {[...new Set([...REGULAR_STATUSES, ...CUSTOM_STATUSES])].map(s => (
                <SelectItem key={s} value={s}>{statLabel(s)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-[#5A5A5A]">
                    Loading orders...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-[#5A5A5A]">No orders found</p>
                  </TableCell>
                </TableRow>
              ) : filtered.map((order) => (
                <TableRow key={`${order._type}-${order.id}`} className="hover:bg-gray-50">
                  <TableCell className="font-mono text-sm">
                    #{order.id?.slice(-6).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    {order._type === 'custom' ? (
                      <Badge className="bg-[#c2d4df]/20 text-[#325b7d] flex items-center gap-1 w-fit">
                        Custom
                      </Badge>
                    ) : (
                      <Badge className="bg-[#C4785A]/20 text-[#C4785A] w-fit">Regular</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-[#2D2D2D]">{order.customer_name}</p>
                    <p className="text-sm text-[#5A5A5A]">{order.customer_email}</p>
                  </TableCell>
                  <TableCell className="text-sm text-[#5A5A5A]">
                    {order._type === 'custom'
                      ? order.request_title || 'Custom request'
                      : `${order.items?.length || 0} item(s)`}
                  </TableCell>
                  <TableCell className="font-medium">
                    {order._type === 'custom' ? 'TBD' : `$${order.total?.toFixed(2)}`}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}>
                      {statLabel(order.status || 'pending')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[#5A5A5A]">
                    {order.created_date
                      ? format(new Date(order.created_date), 'MMM d, yyyy')
                      : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm"
                      onClick={() => setSelected({ order, isCustom: order._type === 'custom' })}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* ── Sidebar Sheet ── */}
        <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            {selected && (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-3">
                    {selected.isCustom
                      ? <Sparkles className="w-5 h-5 text-[#C4785A]" />
                      : <Package className="w-5 h-5 text-[#C4785A]" />}
                    {selected.isCustom ? 'Custom Order' : 'Order'} #{selected.order.id?.slice(-6).toUpperCase()}
                  </SheetTitle>
                  <SheetDescription>
                    {selected.order.created_date &&
                      format(new Date(selected.order.created_date), 'MMMM d, yyyy h:mm a')}
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-8 space-y-6">

                  {/* Customer */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-[#2D2D2D] mb-4">Customer</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#C4785A] rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {selected.order.customer_name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{selected.order.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[#5A5A5A]">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <a href={`mailto:${selected.order.customer_email}`} className="hover:text-[#C4785A]">
                          {selected.order.customer_email}
                        </a>
                      </div>
                      {selected.order.customer_phone && (
                        <div className="flex items-center gap-3 text-sm text-[#5A5A5A]">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span>{selected.order.customer_phone}</span>
                        </div>
                      )}
                      {!selected.isCustom && selected.order.shipping_address && (
                        <div className="flex items-start gap-3 text-sm text-[#5A5A5A]">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span className="whitespace-pre-line">{selected.order.shipping_address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── CUSTOM ORDER details ── */}
                  {selected.isCustom && (
                    <>
                      <div className="p-4 bg-[#FAF7F2] rounded-lg space-y-3">
                        <h3 className="font-semibold text-[#2D2D2D]">Details</h3>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#8B9A7D]">Title</span>
                          <span className="font-medium text-[#2D2D2D]">{selected.order.request_title}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#8B9A7D]">Budget</span>
                          <span className="text-[#2D2D2D]">
                            {BUDGET_LABELS[selected.order.budget] || selected.order.budget || '—'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#8B9A7D]">Timeline</span>
                          <span className="text-[#2D2D2D]">
                            {TIMELINE_LABELS[selected.order.timeline] || selected.order.timeline || '—'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-[#2D2D2D] mb-2">Description</h3>
                        <p className="text-sm text-[#5A5A5A] leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                          {selected.order.request_description || '—'}
                        </p>
                      </div>

                      {/* Reference images */}
                      {selected.order.reference_images?.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-[#2D2D2D] mb-3 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            Reference Images ({selected.order.reference_images.length})
                          </h3>
                          <div className="grid grid-cols-3 gap-2">
                            {selected.order.reference_images.map((url, i) => (
                              <button key={i} onClick={() => setLightbox(url)}
                                className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-80 transition-opacity">
                                <img src={url} alt={`Reference ${i + 1}`} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* ── REGULAR ORDER items ── */}
                  {!selected.isCustom && (
                    <>
                      <div>
                        <h3 className="font-semibold text-[#2D2D2D] mb-4">Items</h3>
                        <div className="space-y-3">
                          {selected.order.items?.map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-[#2D2D2D]">{item.product_name}</p>
                                <p className="text-sm text-[#5A5A5A]">${item.price?.toFixed(2)} × {item.quantity}</p>
                              </div>
                              <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm text-[#5A5A5A]">
                          <span>Subtotal</span><span>${selected.order.subtotal?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-[#5A5A5A]">
                          <span>Shipping</span>
                          <span>{selected.order.shipping_cost === 0 ? 'Free' : `$${selected.order.shipping_cost?.toFixed(2)}`}</span>
                        </div>
                        <div className="flex justify-between text-lg font-semibold text-[#2D2D2D] pt-2 border-t">
                          <span>Total</span><span>${selected.order.total?.toFixed(2)}</span>
                        </div>
                      </div>

                      {selected.order.notes && (
                        <div className="p-4 bg-amber-50 rounded-lg">
                          <h4 className="font-medium text-amber-800 mb-2">Customer Notes</h4>
                          <p className="text-sm text-amber-700">{selected.order.notes}</p>
                        </div>
                      )}

                      <div>
                        <Label>Tracking Number</Label>
                        <Input placeholder="Enter tracking number"
                          defaultValue={selected.order.tracking_number || ''}
                          className="mt-2 rounded-none"
                          onBlur={(e) => {
                            if (e.target.value !== selected.order.tracking_number) {
                              updateTracking(selected.order.id, e.target.value);
                            }
                          }}
                        />
                      </div>
                    </>
                  )}

                  {/* Status update — both types */}
                  <div className="border-t pt-4">
                    <Label>Update Status</Label>
                    <Select value={selected.order.status}
                      onValueChange={(val) => updateStatus(selected.order, val)}>
                      <SelectTrigger className="mt-2 rounded-none"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(selected.isCustom ? CUSTOM_STATUSES : REGULAR_STATUSES).map(s => (
                          <SelectItem key={s} value={s}>{statLabel(s)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Lightbox */}
        {lightbox && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}>
            <img src={lightbox} alt="Reference" className="max-w-full max-h-full object-contain rounded-lg" />
          </div>
        )}

      </div>
    </div>
  );
}