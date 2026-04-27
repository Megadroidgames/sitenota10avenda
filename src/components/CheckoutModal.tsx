import { useState } from "react";
import { ArrowLeft, CheckCircle2, Copy, ExternalLink, Loader2, Phone, QrCode, ShieldCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "@/data/products";
import { useToast } from "@/hooks/use-toast";

interface CheckoutModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

interface PixPaymentResponse {
  mode: "pix" | "checkout";
  pixCode?: string;
  qrCodeImage?: string | null;
  expiresAt?: string | null;
  checkoutUrl?: string;
  message?: string;
}

const formatPrice = (price: number) => `R$ ${price.toFixed(2).replace(".", ",")}`;

const CheckoutModal = ({ product, open, onClose }: CheckoutModalProps) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [contact, setContact] = useState("");
  const [isGeneratingPayment, setIsGeneratingPayment] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PixPaymentResponse | null>(null);
  const { toast } = useToast();

  const resetState = () => {
    setStep(1);
    setContact("");
    setIsGeneratingPayment(false);
    setPaymentResult(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const validateStepOne = () => {
    if (!contact.trim()) {
      toast({
        title: "Campo obrigatorio",
        description: "Informe seu WhatsApp para continuar.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStepOne()) {
      return;
    }

    setStep(2);
  };

  const handleGeneratePix = async () => {
    if (!product) return;
    if (!validateStepOne()) return;

    setIsGeneratingPayment(true);

    try {
      const response = await fetch("/api/sigilopay/pix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product,
          contact,
          customerName: "Cliente Site",
          origin: window.location.origin,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.mode) {
        throw new Error(data?.message ?? "Nao foi possivel gerar o pagamento agora.");
      }

      setPaymentResult(data);
      setStep(3);
    } catch (error) {
      toast({
        title: "Falha ao gerar o pagamento",
        description: error instanceof Error ? error.message : "Tente novamente em instantes.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPayment(false);
    }
  };

  const handleCopyPix = async () => {
    if (!paymentResult?.pixCode) return;

    try {
      await navigator.clipboard.writeText(paymentResult.pixCode);
      toast({
        title: "PIX copiado",
        description: "O codigo PIX foi copiado para a area de transferencia.",
      });
    } catch {
      toast({
        title: "Nao foi possivel copiar",
        description: "Copie o codigo manualmente abaixo.",
        variant: "destructive",
      });
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="overflow-hidden rounded-[1.75rem] border-primary/20 bg-black p-0 shadow-[0_32px_90px_rgba(0,0,0,0.65)] sm:max-w-md">
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-primary/20 to-transparent" />
        <div className="relative space-y-6 p-6">
          {step === 1 ? (
            <>
              <DialogHeader className="space-y-3 text-left">
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  Checkout seguro
                </span>
                <DialogTitle className="text-4xl leading-none text-foreground">Finalizar compra</DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                  Informe o seu WhatsApp ou e-mail onde sera enviado.
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-[1.5rem] border border-primary/15 bg-white/[0.03] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Produto selecionado
                </p>
                <p className="mt-2 text-2xl leading-none text-foreground">{product.name}</p>
                <p className="mt-2 text-sm uppercase tracking-[0.18em] text-muted-foreground">{product.duration}</p>
                <p className="mt-4 text-4xl font-black leading-none text-primary">{formatPrice(product.price)}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact" className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  WhatsApp
                </Label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary/60">
                    <Phone className="h-4 w-4" />
                  </div>
                  <Input
                    id="contact"
                    placeholder="(11) 99999-9999"
                    value={contact}
                    onChange={(event) => setContact(event.target.value)}
                    className="h-12 rounded-full border-primary/15 bg-white/[0.04] pl-11 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                  />
                </div>
              </div>

              <Button
                onClick={handleNext}
                className="h-12 w-full rounded-full bg-primary text-base font-extrabold uppercase tracking-[0.16em] text-primary-foreground hover:bg-primary"
                size="lg"
              >
                Continuar
              </Button>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <DialogHeader className="space-y-3 text-left">
                <DialogTitle className="flex items-center gap-2 text-4xl leading-none text-foreground">
                  <button
                    onClick={() => setStep(1)}
                    className="rounded-full border border-primary/20 bg-primary/10 p-2 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  Confirmar dados
                </DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                  Voce sera redirecionado para a pagina de pagamento segura.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 rounded-[1.5rem] border border-primary/15 bg-white/[0.03] p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Produto</p>
                  <p className="mt-2 text-2xl leading-none text-foreground">{product.name}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">WhatsApp</p>
                  <p className="mt-2 break-all text-sm text-foreground">{contact}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Valor</p>
                  <p className="mt-2 text-4xl font-black leading-none text-primary">{formatPrice(product.price)}</p>
                </div>
              </div>

              <Button
                onClick={handleGeneratePix}
                className="h-12 w-full rounded-full bg-primary text-base font-extrabold uppercase tracking-[0.16em] text-primary-foreground hover:bg-primary"
                size="lg"
                disabled={isGeneratingPayment}
              >
                {isGeneratingPayment ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando PIX...
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4" />
                    Gerar PIX agora
                  </>
                )}
              </Button>
            </>
          ) : null}

          {step === 3 && paymentResult ? (
            <>
              <DialogHeader className="space-y-3 text-left">
                <DialogTitle className="flex items-center gap-2 text-4xl leading-none text-foreground">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                  {paymentResult.mode === "pix" ? "PIX gerado" : "Pagamento pronto"}
                </DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                  {paymentResult.mode === "pix"
                    ? "Use o QR Code ou copie o codigo PIX abaixo para pagar agora."
                    : paymentResult.message ?? "Abrimos uma alternativa segura para concluir seu pagamento."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 rounded-[1.5rem] border border-primary/15 bg-white/[0.03] p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Produto</p>
                  <p className="mt-2 text-2xl leading-none text-foreground">{product.name}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Valor</p>
                  <p className="mt-2 text-4xl font-black leading-none text-primary">{formatPrice(product.price)}</p>
                </div>
              </div>

              {paymentResult.mode === "pix" && paymentResult.pixCode ? (
                <div className="space-y-4 rounded-[1.5rem] border border-primary/15 bg-white/[0.03] p-5">
                  <div className="flex justify-center">
                    {paymentResult.qrCodeImage ? (
                      <img
                        src={paymentResult.qrCodeImage}
                        alt="QR Code PIX"
                        className="h-52 w-52 rounded-2xl border border-primary/10 bg-white p-3"
                      />
                    ) : (
                      <div className="rounded-2xl border border-primary/10 bg-white p-3">
                        <QRCodeSVG value={paymentResult.pixCode} size={184} />
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">PIX copia e cola</p>
                    <div className="mt-2 rounded-2xl border border-primary/10 bg-black/50 p-4">
                      <p className="break-all font-mono text-xs leading-relaxed text-foreground">{paymentResult.pixCode}</p>
                    </div>
                  </div>

                  <Button
                    onClick={handleCopyPix}
                    variant="outline"
                    className="h-12 w-full rounded-full border-primary/20 bg-primary/10 text-base font-bold uppercase tracking-[0.16em] text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar PIX
                  </Button>

                  <p className="text-center text-[11px] font-medium leading-relaxed text-muted-foreground">
                    Apos o pagamento, a confirmacao pode levar alguns instantes.
                  </p>
                </div>
              ) : null}

              {paymentResult.mode === "checkout" && paymentResult.checkoutUrl ? (
                <Button
                  onClick={() => window.open(paymentResult.checkoutUrl, "_self")}
                  className="h-12 w-full rounded-full bg-primary text-base font-extrabold uppercase tracking-[0.16em] text-primary-foreground hover:bg-primary"
                  size="lg"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir checkout seguro
                </Button>
              ) : null}

              <Button
                onClick={handleClose}
                variant="ghost"
                className="h-11 w-full rounded-full text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground hover:bg-white/5 hover:text-foreground"
              >
                Fechar
              </Button>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
