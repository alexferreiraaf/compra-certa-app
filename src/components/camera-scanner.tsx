'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Camera, Loader2, Upload, Plus, Minus, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, parseCurrency } from '@/lib/utils';
import { analyzePriceTag, PriceTagAnalysisOutput } from '@/ai/flows/ai-price-tag-analysis';

interface CameraScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: { name: string; price: number; quantity: number }) => void;
}

type ScannerState = 'camera' | 'analyzing' | 'confirming';

export function CameraScanner({
  open,
  onOpenChange,
  onConfirm,
}: CameraScannerProps) {
  const { toast } = useToast();
  const [scannerState, setScannerState] = useState<ScannerState>('camera');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<PriceTagAnalysisOutput | null>(null);

  // Form states
  const [editedProductName, setEditedProductName] = useState('');
  const [selectedPriceType, setSelectedPriceType] = useState<'retail' | 'wholesale' | 'special' | 'custom'>('retail');
  const [customPrice, setCustomPrice] = useState('');
  const [quantity, setQuantity] = useState(1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (open) {
      setScannerState('camera');
      setCapturedImage(null);
      setAnalysisResult(null);
      setQuantity(1);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [open]);

  // Adjust quantity based on selected price type
  useEffect(() => {
    if (selectedPriceType === 'wholesale' && analysisResult?.wholesaleMinQuantity) {
      setQuantity(analysisResult.wholesaleMinQuantity);
    } else if (selectedPriceType !== 'wholesale' && quantity === analysisResult?.wholesaleMinQuantity) {
      setQuantity(1);
    }
  }, [selectedPriceType, analysisResult]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        stopCamera();
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setHasCameraPermission(true);
    } catch (err) {
      console.error('Erro ao acessar a câmera: ', err);
      setHasCameraPermission(false);
      setCameraError('Não foi possível acessar a câmera do dispositivo. Utilize o envio de foto.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
        analyzeImage(dataUrl);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCapturedImage(base64String);
        stopCamera();
        analyzeImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64: string) => {
    setScannerState('analyzing');
    try {
      const result = await analyzePriceTag(base64);
      setAnalysisResult(result);
      setEditedProductName(result.productName || '');
      
      // Determine initial selection based on what is available
      if (result.retailPrice !== null) {
        setSelectedPriceType('retail');
        setCustomPrice('');
      } else if (result.specialPrice !== null) {
        setSelectedPriceType('special');
        setCustomPrice('');
      } else if (result.wholesalePrice !== null) {
        setSelectedPriceType('wholesale');
        setCustomPrice('');
        setQuantity(result.wholesaleMinQuantity || 1);
      } else {
        setSelectedPriceType('custom');
        setCustomPrice('R$ 0,00');
      }
      
      setScannerState('confirming');
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Falha na leitura',
        description: 'Não conseguimos identificar as informações. Tente tirar a foto novamente com foco na etiqueta.',
      });
      setScannerState('camera');
      if (hasCameraPermission) {
        startCamera();
      }
    }
  };

  const getSelectedPrice = (): number => {
    if (!analysisResult) return 0;
    switch (selectedPriceType) {
      case 'retail':
        return analysisResult.retailPrice || 0;
      case 'wholesale':
        return analysisResult.wholesalePrice || 0;
      case 'special':
        return analysisResult.specialPrice || 0;
      case 'custom':
        return parseCurrency(customPrice);
      default:
        return 0;
    }
  };

  const handleConfirm = () => {
    const finalPrice = getSelectedPrice();
    if (!editedProductName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Nome obrigatório',
        description: 'Por favor, confirme ou ajuste o nome do produto.',
      });
      return;
    }

    onConfirm({
      name: editedProductName.trim(),
      price: finalPrice,
      quantity,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <Camera className="h-6 w-6 text-primary" />
            Scanner de Etiquetas
          </DialogTitle>
          <DialogDescription>
            {scannerState === 'camera' && 'Aponte a câmera para a etiqueta ou tire uma foto.'}
            {scannerState === 'analyzing' && 'Enviando imagem para análise da Inteligência Artificial...'}
            {scannerState === 'confirming' && 'Confirme as informações detectadas pela Inteligência Artificial.'}
          </DialogDescription>
        </DialogHeader>

        {/* STATE: CAMERA STREAM */}
        {scannerState === 'camera' && (
          <div className="flex flex-col items-center gap-4 py-4">
            {hasCameraPermission ? (
              <div className="relative overflow-hidden rounded-lg border bg-black aspect-video w-full max-w-sm">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full">
                <Label
                  htmlFor="camera-fallback"
                  className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 transition-all hover:bg-muted/30"
                >
                  <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
                  <span className="font-semibold text-sm">Capturar ou Enviar Foto</span>
                  <span className="text-xs text-muted-foreground mt-1">Toque para tirar foto da etiqueta</span>
                  <input
                    id="camera-fallback"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </Label>
                {cameraError && (
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    {cameraError}
                  </p>
                )}
              </div>
            )}

            <div className="flex w-full gap-2">
              {hasCameraPermission && (
                <>
                  <Button onClick={capturePhoto} className="flex-1 text-lg h-12 bg-accent text-accent-foreground hover:bg-accent/90">
                    Capturar Foto
                  </Button>
                  <Label
                    htmlFor="camera-fallback-btn"
                    className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg border bg-card hover:bg-muted"
                  >
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <input
                      id="camera-fallback-btn"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </Label>
                </>
              )}
              {!hasCameraPermission && cameraError && (
                <Button onClick={startCamera} variant="outline" className="w-full gap-2 h-12">
                  <RefreshCw className="h-4 w-4" /> Tentar Câmera Novamente
                </Button>
              )}
            </div>
          </div>
        )}

        {/* STATE: ANALYZING LOADER */}
        {scannerState === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            {capturedImage && (
              <div className="relative overflow-hidden rounded-lg border bg-black max-h-36 aspect-video mb-2">
                <img src={capturedImage} alt="Captured label" className="h-full w-full object-cover opacity-60" />
              </div>
            )}
            <Loader2 className="h-10 w-10 animate-spin text-accent" />
            <p className="text-base font-semibold animate-pulse text-muted-foreground">Lendo dados da etiqueta...</p>
          </div>
        )}

        {/* STATE: CONFIRMATION FORM */}
        {scannerState === 'confirming' && analysisResult && (
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="scanned-name" className="text-sm font-semibold">Produto</Label>
              <Input
                id="scanned-name"
                type="text"
                value={editedProductName}
                onChange={(e) => setEditedProductName(e.target.value)}
                className="h-12 text-base font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Escolha o Preço a Aplicar</Label>
              <RadioGroup
                value={selectedPriceType}
                onValueChange={(val: any) => setSelectedPriceType(val)}
                className="grid gap-3"
              >
                {analysisResult.retailPrice !== null && (
                  <Label
                    htmlFor="price-retail"
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${selectedPriceType === 'retail' ? 'border-accent bg-accent/10' : 'hover:bg-muted/30'}`}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="retail" id="price-retail" />
                      <div>
                        <span className="font-semibold text-sm block">Varejo</span>
                        <span className="text-xs text-muted-foreground">Preço normal por unidade</span>
                      </div>
                    </div>
                    <span className="font-bold text-lg text-primary">R$ {analysisResult.retailPrice.toFixed(2)}</span>
                  </Label>
                )}

                {analysisResult.wholesalePrice !== null && (
                  <Label
                    htmlFor="price-wholesale"
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${selectedPriceType === 'wholesale' ? 'border-accent bg-accent/10' : 'hover:bg-muted/30'}`}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="wholesale" id="price-wholesale" />
                      <div>
                        <span className="font-semibold text-sm block">Atacado</span>
                        <span className="text-xs text-muted-foreground">A partir de {analysisResult.wholesaleMinQuantity || 6} unidades</span>
                      </div>
                    </div>
                    <span className="font-bold text-lg text-primary">R$ {analysisResult.wholesalePrice.toFixed(2)}</span>
                  </Label>
                )}

                {analysisResult.specialPrice !== null && (
                  <Label
                    htmlFor="price-special"
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${selectedPriceType === 'special' ? 'border-accent bg-accent/10' : 'hover:bg-muted/30'}`}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="special" id="price-special" />
                      <div>
                        <span className="font-semibold text-sm block">{analysisResult.specialPriceLabel || 'Preço Especial'}</span>
                        <span className="text-xs text-muted-foreground">Com cartão ou fidelidade</span>
                      </div>
                    </div>
                    <span className="font-bold text-lg text-primary">R$ {analysisResult.specialPrice.toFixed(2)}</span>
                  </Label>
                )}

                <Label
                  htmlFor="price-custom"
                  className={`flex flex-col gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedPriceType === 'custom' ? 'border-accent bg-accent/10' : 'hover:bg-muted/30'}`}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="custom" id="price-custom" />
                    <div>
                      <span className="font-semibold text-sm block">Outro Valor</span>
                      <span className="text-xs text-muted-foreground">Digitar preço personalizado</span>
                    </div>
                  </div>
                  {selectedPriceType === 'custom' && (
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="R$ 0,00"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(formatCurrency(e.target.value))}
                      className="h-10 text-center text-base"
                      onClick={(e) => e.preventDefault()} // Prevent radio change
                      autoFocus
                    />
                  )}
                </Label>
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-sm font-semibold text-muted-foreground">Quantidade</span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center text-lg font-bold">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setQuantity(prev => prev + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          {scannerState === 'confirming' ? (
            <>
              <Button variant="secondary" onClick={() => setScannerState('camera')} className="h-12 text-base">
                Refazer Foto
              </Button>
              <Button onClick={handleConfirm} className="h-12 text-base bg-accent text-accent-foreground hover:bg-accent/90">
                Adicionar à Lista
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => onOpenChange(false)} className="w-full h-12 text-base">
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
