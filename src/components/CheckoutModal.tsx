import { useState } from "react";
import { ArrowLeft, ExternalLink, Loader2, Mail, Phone, ShieldCheck } from "lucide-react";
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

const CheckoutModal = ({ product, open, onClose }: CheckoutModalProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [contact, setContact] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setStep(1);
    setContact("");
    setIsRedirecting(false);
    onClose();
  };

  const handleNext = () => {
    if (!contact.trim()) {
      toast({
        title: "Campo obrigatorio",
        description: "Informe seu WhatsApp ou email para continuar.",
        variant: "destructive",
      });
      return;
    }

    setStep(2);
  };

  const handleOpenCheckout = async () => {
    if (!product) return;

    setIsRedirecting(true);

    try {
      const response = await fetch("/api/sigilopay/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product,
          contact,
          origin: window.location.origin,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.checkoutUrl) {
        throw new Error(data?.message ?? "Nao foi possivel iniciar o checkout.");
      }

      window.location.assign(data.checkoutUrl);
    } catch (error) {
      toast({
        title: "Falha ao abrir o checkout",
        description: error instanceof Error ? error.message : "Tente novamente em instantes.",
        variant: "destructive",
      });
      setIsRedirecting(false);
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
                  Informe o seu WhatsApp ou e-mail onde será enviado.
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-[1.5rem] border border-primary/15 bg-white/[0.03] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Produto selecionado
                </p>
                <p className="mt-2 text-2xl leading-none text-foreground">{product.name}</p>
                <p className="mt-2 text-sm uppercase tracking-[0.18em] text-muted-foreground">
                  {product.duration}
                </p>
                <p className="mt-4 text-4xl font-black leading-none text-primary">
                  R$ {product.price.toFixed(2).replace(".", ",")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact" className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  WhatsApp ou email
                </Label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary/60">
                    {contact.includes("@") ? (
                      <Mail className="h-4 w-4" />
                    ) : (
                      <Phone className="h-4 w-4" />
                    )}
                  </div>
                  <Input
                    id="contact"
                    placeholder="(11) 99999-9999 ou email@exemplo.com"
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
          ) : (
            <>
              <DialogHeader className="space-y-3 text-left">
                <DialogTitle className="flex items-center gap-2 text-4xl leading-none text-foreground">
                  <button
                    onClick={() => setStep(1)}
                    className="rounded-full border border-primary/20 bg-primary/10 p-2 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  Revisao final
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
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Contato</p>
                  <p className="mt-2 break-all text-sm text-foreground">{contact}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Valor</p>
                  <p className="mt-2 text-4xl font-black leading-none text-primary">
                    R$ {product.price.toFixed(2).replace(".", ",")}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleOpenCheckout}
                className="h-12 w-full rounded-full bg-primary text-base font-extrabold uppercase tracking-[0.16em] text-primary-foreground hover:bg-primary"
                size="lg"
                disabled={isRedirecting}
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Abrindo checkout...
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4" />
                    Ir para o pagamento
                  </>
                )}
              </Button>

              <p className="px-4 text-center text-[11px] font-medium leading-relaxed text-muted-foreground">
                O pedido fica vinculado ao contato informado para agilizar seu atendimento.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
