"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/hooks/use-cart";
import { useLocale } from "@/i18n/LocaleContext";
import { getShippingZones, createOrder, type OrderItemInput } from "@/actions/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PaymentMethod } from "@prisma/client";
import { 
  ShoppingBag, 
  Truck, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  CheckCircle2, 
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type ShippingZoneItem = {
  id: string;
  governorateAr: string;
  governorateEn: string;
  shippingFee: any;
  estimatedDaysAr: string | null;
  estimatedDaysEn: string | null;
};

export default function CheckoutPage() {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const currency = isAr ? "ج.م" : "EGP";

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const [mounted, setMounted] = useState(false);
  const [shippingZones, setShippingZones] = useState<ShippingZoneItem[]>([]);
  const [selectedZone, setSelectedZone] = useState<ShippingZoneItem | null>(null);

  // Form Fields
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [city, setCity] = useState("");
  const [addressDetails, setAddressDetails] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH_ON_DELIVERY);
  const [senderWallet, setSenderWallet] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setMounted(true);
    getShippingZones().then((res) => {
      if (res.success && res.data) {
        setShippingZones(res.data);
        if (res.data.length > 0) {
          setSelectedZone(res.data[0]);
        }
      }
    });
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-16 text-center min-h-[60vh] flex items-center justify-center font-cairo">
        <div className="animate-pulse space-y-4">
          <div className="w-12 h-12 bg-amber-100 rounded-full mx-auto" />
          <p className="text-neutral-500 font-bold">{isAr ? "جاري تحميل تفاصيل الطلب والدفع..." : "Loading checkout details..."}</p>
        </div>
      </div>
    );
  }

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = selectedZone ? Number(selectedZone.shippingFee) : 50;
  const totalAmount = subtotal + shippingFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!customerName.trim() || !customerPhone.trim() || !addressDetails.trim() || !city.trim()) {
      setErrorMessage(isAr ? "يرجى ملء جميع الحقول المطلوبة (الاسم، الهاتف، المدينة، العنوان)" : "Please fill in all required fields.");
      return;
    }

    if (!selectedZone) {
      setErrorMessage(isAr ? "يرجى اختيار المحافظة لحساب الشحن" : "Please select a governorate.");
      return;
    }

    setIsSubmitting(true);

    const orderItems: OrderItemInput[] = items.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      productNameAr: i.name,
      productNameEn: i.name,
      variantDetails: i.size ? `${i.size}${i.color ? ` - ${i.color}` : ""}` : undefined,
      unitPrice: i.price,
      quantity: i.quantity,
    }));

    const result = await createOrder({
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      governorate: isAr ? selectedZone.governorateAr : selectedZone.governorateEn,
      shippingZoneId: selectedZone.id,
      city,
      addressDetails,
      notes: notes || undefined,
      shippingFee,
      subtotal,
      paymentMethod,
      senderWallet: senderWallet || undefined,
      items: orderItems,
    });

    setIsSubmitting(false);

    if (result.success && result.data) {
      setCompletedOrder(result.data);
      clearCart();
    } else {
      setErrorMessage(result.error || (isAr ? "حدث خطأ أثناء تنفيذ الطلب" : "Order failed."));
    }
  };

  // Success Screen
  if (completedOrder) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-neutral-50/50">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-neutral-100 text-center space-y-6">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-600">
            <CheckCircle2 size={48} />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-neutral-900 font-cairo">
              {isAr ? "تم استلام طلبك بنجاح! 🎉" : "Order Placed Successfully! 🎉"}
            </h2>
            <p className="text-xs text-neutral-500 font-cairo">
              {isAr ? "شكراً لتسوقك من محامص نَتس. سنقوم بتجهيز مكسراتك طازجة فوراً!" : "Thank you for shopping at Nuts Roastery. We are preparing your order fresh!"}
            </p>
          </div>

          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100/80 text-start space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">{isAr ? "رقم الطلب:" : "Order Number:"}</span>
              <span className="font-bold text-amber-900 font-mono">{completedOrder.orderNumber}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">{isAr ? "الإجمالي المستحق:" : "Total Amount:"}</span>
              <span className="font-bold text-neutral-900 font-cairo">{totalAmount} {currency}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">{isAr ? "طريقة الدفع:" : "Payment Method:"}</span>
              <span className="font-bold text-neutral-700">
                {paymentMethod === PaymentMethod.CASH_ON_DELIVERY && (isAr ? "الدفع عند الاستلام" : "Cash on Delivery")}
                {paymentMethod === PaymentMethod.PAYMOB_WALLET && (isAr ? "محفظة إلكترونية (فودافون كاش)" : "Mobile Wallet")}
                {paymentMethod === PaymentMethod.INSTAPAY_MANUAL && (isAr ? "تحويل إنستاباي" : "InstaPay Transfer")}
                {paymentMethod === PaymentMethod.PAYMOB_CARD && (isAr ? "بطاقة بنكية / ميزة" : "Bank Card / Meeza")}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center h-12 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold font-cairo text-sm transition-all"
            >
              {isAr ? "العودة للرئيسية" : "Back to Home"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty Cart Screen
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-4">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400">
          <ShoppingBag size={32} />
        </div>
        <h2 className="text-xl font-black text-neutral-900 font-cairo">
          {isAr ? "سلة المشتريات فارغة" : "Your Cart is Empty"}
        </h2>
        <p className="text-sm text-neutral-500 max-w-sm">
          {isAr ? "تصفح أشهى أنواع المكسرات المحمصة والنيئة وأضفها للسلة." : "Browse our delicious roasted and raw nuts to fill your cart."}
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm font-cairo transition-all"
        >
          {isAr ? "تصفح المكسرات الآن" : "Shop Nuts Now"}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 py-10 sm:py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 font-cairo">
              {isAr ? "إتمام الطلب والشحن" : "Checkout & Delivery"}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              {isAr ? "أدخل بيانات التوصيل واختر طريقة الدفع المناسبة لك" : "Enter your delivery details and choose your payment method"}
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-800"
          >
            {isAr ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            <span>{isAr ? "متابعة التسوق" : "Continue Shopping"}</span>
          </Link>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Customer & Delivery Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section 1: Customer Details */}
            <div className="p-6 bg-white rounded-3xl border border-neutral-100 shadow-xs space-y-4">
              <h3 className="font-black text-base text-neutral-900 flex items-center gap-2 font-cairo">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center">1</span>
                {isAr ? "بيانات العميل" : "Customer Information"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-bold text-neutral-700">
                    {isAr ? "الاسم بالكامل *" : "Full Name *"}
                  </Label>
                  <Input
                    id="name"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={isAr ? "مثال: أحمد محمد" : "e.g. John Doe"}
                    className="rounded-xl h-11"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-bold text-neutral-700">
                    {isAr ? "رقم الموبايل المصري *" : "Egyptian Mobile *"}
                  </Label>
                  <Input
                    id="phone"
                    required
                    type="tel"
                    dir="ltr"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="010XXXXXXXX / 011 / 012"
                    className="rounded-xl h-11"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-neutral-700">
                  {isAr ? "البريد الإلكتروني (اختياري لتأكيد الطلب)" : "Email (Optional)"}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="rounded-xl h-11"
                />
              </div>
            </div>

            {/* Section 2: Egyptian Address & Governorate */}
            <div className="p-6 bg-white rounded-3xl border border-neutral-100 shadow-xs space-y-4">
              <h3 className="font-black text-base text-neutral-900 flex items-center gap-2 font-cairo">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center">2</span>
                {isAr ? "عنوان التوصيل في مصر" : "Delivery Address in Egypt"}
              </h3>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-neutral-700">
                  {isAr ? "المحافظة (لتحديد سعر التوصيل) *" : "Governorate *"}
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {shippingZones.map((zone) => {
                    const isSelected = selectedZone?.id === zone.id;
                    return (
                      <button
                        key={zone.id}
                        type="button"
                        onClick={() => setSelectedZone(zone)}
                        className={`p-3 rounded-2xl border text-start flex flex-col justify-between transition-all ${
                          isSelected
                            ? "border-amber-600 bg-amber-50/50 shadow-xs ring-1 ring-amber-600"
                            : "border-neutral-200 hover:border-neutral-300 bg-white"
                        }`}
                      >
                        <span className="font-bold text-xs text-neutral-900 font-cairo">
                          {isAr ? zone.governorateAr : zone.governorateEn}
                        </span>
                        <div className="flex items-center justify-between mt-2 text-[11px]">
                          <span className="text-neutral-500">
                            {isAr ? zone.estimatedDaysAr : zone.estimatedDaysEn}
                          </span>
                          <span className="font-bold text-amber-800">
                            {Number(zone.shippingFee)} {currency}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs font-bold text-neutral-700">
                  {isAr ? "المدينة / المنطقة *" : "City / District *"}
                </Label>
                <Input
                  id="city"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={isAr ? "مثال: المعادي، مصر الجديدة، التجمع الخامس، سموحة..." : "e.g. Maadi, New Cairo..."}
                  className="rounded-xl h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-xs font-bold text-neutral-700">
                  {isAr ? "العنوان التفصيلي (الشارع، رقم العقار، الشقة) *" : "Detailed Address *"}
                </Label>
                <Input
                  id="address"
                  required
                  value={addressDetails}
                  onChange={(e) => setAddressDetails(e.target.value)}
                  placeholder={isAr ? "شارع... عمارة رقم... الدور... شقة..." : "Street, Building no., Floor, Apt..."}
                  className="rounded-xl h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-bold text-neutral-700">
                  {isAr ? "ملاحظات للتوصيل (اختياري)" : "Delivery Notes (Optional)"}
                </Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isAr ? "مثال: الاتصال قبل الوصول بنصف ساعة" : "e.g. Call before arrival"}
                  className="rounded-xl h-11"
                />
              </div>
            </div>

            {/* Section 3: Egyptian Payment Methods */}
            <div className="p-6 bg-white rounded-3xl border border-neutral-100 shadow-xs space-y-4">
              <h3 className="font-black text-base text-neutral-900 flex items-center gap-2 font-cairo">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center">3</span>
                {isAr ? "طريقة الدفع" : "Payment Method"}
              </h3>

              <div className="space-y-2.5">
                {/* Option 1: COD */}
                <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === PaymentMethod.CASH_ON_DELIVERY ? "border-amber-600 bg-amber-50/40 ring-1 ring-amber-600" : "border-neutral-200"
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    className="mt-1"
                    checked={paymentMethod === PaymentMethod.CASH_ON_DELIVERY}
                    onChange={() => setPaymentMethod(PaymentMethod.CASH_ON_DELIVERY)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 font-cairo">
                      <Banknote className="w-4 h-4 text-amber-700" />
                      <span>{isAr ? "الدفع نقداً عند الاستلام (COD)" : "Cash on Delivery"}</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {isAr ? "ادفع نقداً لمندوب الشحن عند استلام وتأكيد طلبك." : "Pay cash directly to the courier upon delivery."}
                    </p>
                  </div>
                </label>

                {/* Option 2: Mobile Wallet */}
                <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === PaymentMethod.PAYMOB_WALLET ? "border-amber-600 bg-amber-50/40 ring-1 ring-amber-600" : "border-neutral-200"
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    className="mt-1"
                    checked={paymentMethod === PaymentMethod.PAYMOB_WALLET}
                    onChange={() => setPaymentMethod(PaymentMethod.PAYMOB_WALLET)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 font-cairo">
                      <Smartphone className="w-4 h-4 text-red-600" />
                      <span>{isAr ? "محفظة إلكترونية (فودافون كاش / أورنج / اتصالات / وي)" : "Mobile Wallets (Vodafone Cash, etc.)"}</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {isAr ? "تحويل آمن عبر محافظ الهاتف المحمول المصرية." : "Instant mobile wallet transfer across Egypt."}
                    </p>
                  </div>
                </label>

                {/* Option 3: InstaPay */}
                <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === PaymentMethod.INSTAPAY_MANUAL ? "border-amber-600 bg-amber-50/40 ring-1 ring-amber-600" : "border-neutral-200"
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    className="mt-1"
                    checked={paymentMethod === PaymentMethod.INSTAPAY_MANUAL}
                    onChange={() => setPaymentMethod(PaymentMethod.INSTAPAY_MANUAL)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 font-cairo">
                      <CreditCard className="w-4 h-4 text-purple-600" />
                      <span>{isAr ? "تحويل فوري عبر إنستاباي (InstaPay)" : "InstaPay Instant Transfer"}</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {isAr ? "تحويل لحساب المحمصة عبر تطبيق إنستاباي وتأكيد فوري للطلب." : "Instant bank transfer using the InstaPay app."}
                    </p>
                  </div>
                </label>

                {/* Option 4: Card */}
                <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === PaymentMethod.PAYMOB_CARD ? "border-amber-600 bg-amber-50/40 ring-1 ring-amber-600" : "border-neutral-200"
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    className="mt-1"
                    checked={paymentMethod === PaymentMethod.PAYMOB_CARD}
                    onChange={() => setPaymentMethod(PaymentMethod.PAYMOB_CARD)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 font-cairo">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span>{isAr ? "بطاقات ميزة / فيزا / ماستركارد" : "Meeza Cards, Visa & MasterCard"}</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {isAr ? "دفع آمن بالبطاقات البنكية المصرية." : "Secure debit/credit card payment."}
                    </p>
                  </div>
                </label>
              </div>

              {paymentMethod === PaymentMethod.PAYMOB_WALLET && (
                <div className="p-3 bg-red-50/60 rounded-xl border border-red-100 text-xs text-red-800 space-y-1">
                  <span className="font-bold">{isAr ? "رقم محفظة التحويل:" : "Transfer Wallet:"}</span>
                  <p className="font-mono text-sm font-bold">01000000000</p>
                  <p className="text-[11px] text-neutral-600">
                    {isAr ? "يرجى كتابة رقم هاتفك المحول منه لتأكيد الحوالة فوراً." : "Please enter the phone number you transferred from."}
                  </p>
                  <Input
                    placeholder={isAr ? "رقم المحفظة التي قمت بالتحويل منها" : "Sender wallet number"}
                    value={senderWallet}
                    onChange={(e) => setSenderWallet(e.target.value)}
                    className="mt-2 bg-white"
                  />
                </div>
              )}

              {paymentMethod === PaymentMethod.INSTAPAY_MANUAL && (
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs text-purple-900 space-y-1">
                  <span className="font-bold">{isAr ? "عنوان إنستاباي المعتمد (IPA):" : "Official InstaPay Address:"}</span>
                  <p className="font-mono text-sm font-bold">nuts.roastery@instapay</p>
                  <p className="text-[11px] text-neutral-600">
                    {isAr ? "قم بالتحويل عبر تطبيق InstaPay وسيتواصل معك فريقنا لتأكيد التوصيل." : "Transfer via InstaPay and our team will confirm delivery."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary (5 cols) */}
          <div className="lg:col-span-5">
            <div className="p-6 bg-white rounded-3xl border border-neutral-100 shadow-xs sticky top-24 space-y-6">
              <h3 className="font-black text-base text-neutral-900 font-cairo">
                {isAr ? "ملخص الطلب" : "Order Summary"}
              </h3>

              {/* Items List */}
              <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.variantId} className="py-3 flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                      {item.image && (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-neutral-900 truncate font-cairo">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-500 font-cairo">
                        {item.size && <span className="text-amber-800 font-bold">{item.size}</span>}
                        {item.color && <span>• {item.color}</span>}
                        <span>• الكمية: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-end shrink-0">
                      <span className="text-xs font-bold text-neutral-900 font-cairo">
                        {item.price * item.quantity} {currency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="pt-4 border-t border-neutral-100 space-y-2 text-xs font-cairo">
                <div className="flex justify-between text-neutral-500">
                  <span>{isAr ? "المجموع الفرعي:" : "Subtotal:"}</span>
                  <span className="font-bold text-neutral-800">{subtotal} {currency}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>{isAr ? "تكلفة الشحن والتوصيل:" : "Shipping Fee:"}</span>
                  <span className="font-bold text-amber-800">{shippingFee} {currency}</span>
                </div>
                <div className="flex justify-between text-base font-black text-neutral-900 pt-2 border-t border-neutral-100">
                  <span>{isAr ? "المجموع الكلي:" : "Total:"}</span>
                  <span className="text-amber-800">{totalAmount} {currency}</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black font-cairo text-base shadow-lg shadow-amber-600/20 active:scale-[0.99] transition-all"
              >
                {isSubmitting ? (
                  <span>{isAr ? "جاري تسجيل الطلب..." : "Processing Order..."}</span>
                ) : (
                  <span>{isAr ? `تأكيد الطلب (${totalAmount} ${currency})` : `Confirm Order (${totalAmount} ${currency})`}</span>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400 font-cairo">
                <ShieldCheck size={16} className="text-green-600" />
                <span>{isAr ? "تسوق آمن ومحمي 100% مع ضمان الجودة" : "100% Secure Shopping with Quality Guarantee"}</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
