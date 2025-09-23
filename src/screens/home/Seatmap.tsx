import React, {useCallback, useEffect, useRef, useState} from 'react';
import {IEventShow} from '../../types';
import WebView from 'react-native-webview';
import {useWindowDimensions} from 'react-native';
import {Button, Text, Separator, Stack, XStack, YStack} from 'tamagui';
import {Minus, Plus, Tickets, Undo2, X} from '@tamagui/lucide-icons';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {priceFormat} from '../../utils';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useToastController} from '@tamagui/toast';
import QuantityInput from '../../components/QuantityInput';

const WEBVIEW_HTML = `
  <!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
        body,
        html {
            margin: 0;
            padding: 0;
            overflow: hidden;
        }

        canvas {
            display: block;
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/fabric@6.7.1/dist/index.min.js"></script>
</head>

<body style="display: flex; justify-content: center; align-items: center; height: 100dvh; background-color: transparent;">
    <canvas id="c"></canvas>
    <script>
      (function(){
        const origLog = console.log;
        console.log = function(...args){
          try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type:'log', msg: args})); }
          catch(e){}
          origLog.apply(console, args);
        };
        window.onerror = function(message, source, lineno, colno, error){
          try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type:'error', message, source, lineno, colno, error: error && error.toString()})); } catch(e){}
        }
      })();

      fabric.FabricObject.customProperties = [
        "id",
        "shapeId",
        "areaType",
        "ticketTypeId",
        "customLabel",
      ];

      let screenWidth;
      const canvas = new fabric.Canvas("c", { selection: false });
      

      const originalWidth = 698;
      const originalHeight = 498;

      document.addEventListener("message", function(event) {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "init") {
            const json = data.json;
            const tickets = data.tickets;
            screenWidth = data.screenWidth;

            const scale = screenWidth / originalWidth;
            const scaledHeight = originalHeight * scale;
            
            canvas.setWidth(screenWidth);
            canvas.setHeight(scaledHeight);

            canvas.on("mouse:down", function (e) {
                if (e.target) {
                    window.ReactNativeWebView?.postMessage(
                        JSON.stringify({
                            type: "OBJECT_CLICK",
                            object: e.target
                        })
                    );
                }
            });

            canvas.loadFromJSON(json).then(() => {
                canvas.setViewportTransform([scale, 0, 0, scale, 0, 0]);
                canvas.forEachObject((obj) => {
                    obj.selectable = false;
                    obj.evented = true;       
                });
                tickets.forEach(ticket => {
                  const objects = canvas.getObjects().filter(o => o.areaType === 'ticket' && o.ticketTypeId === ticket.seatmap_block_id);
                  objects.forEach(obj => {
                    if (ticket.stock <= 0) {
                      const rect = obj.getObjects()[0];
                      const text = obj.getObjects()[1];
                      text.set('fill', 'white');
                      rect.set('fill', '#c7c2c2');
                    }
                  });
                });
                canvas.renderAll();
            });
          } else if (data.type === "ZOOM_IN") {
            canvas.setWidth(canvas.getWidth() * 1.1);
            canvas.setHeight(canvas.getHeight() * 1.1);
            canvas.setZoom(canvas.getZoom() * 1.1);
          } else if (data.type === "ZOOM_OUT") {
            canvas.setWidth(canvas.getWidth() * 0.9);
            canvas.setHeight(canvas.getHeight() * 0.9);
            canvas.setZoom(canvas.getZoom() * 0.9);
          } else if (data.type === "ZOOM_RESET") {
            const scale = screenWidth / originalWidth;
            canvas.setWidth(screenWidth);
            canvas.setHeight(originalHeight * scale);
            canvas.setViewportTransform([scale, 0, 0, scale, 0, 0]);
          }
        } catch (e) {
          console.error("Parse error", e);
        }
      });
    </script>
  </body>

</html>
  `;

export default function Seatmap({
  eventShow,
  getTicketValue,
  setQuantity,
}: {
  eventShow: IEventShow;
  onTicketAdded: (ticketId: number, quantity: number) => void;
  getTicketValue: (ticketId: number) => number;
  setQuantity: (ticketId: number, quantity: number) => void;
}) {
  const toast = useToastController();
  const insets = useSafeAreaInsets();
  const [isWebviewLoaded, setIsWebviewLoaded] = useState(false);
  const webviewRef = useRef<WebView>(null);

  const [selectedTicket, setSelectedTicket] = useState<number>(-1);

  const getSelectedTicket = () => {
    return eventShow.tickets.find(t => t.id === selectedTicket);
  };

  const ticketsInfoBottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handleTicketsInfoPresentModalPress = useCallback(() => {
    ticketPickerBottomSheetModalRef.current?.dismiss();
    ticketsInfoBottomSheetModalRef.current?.present();
  }, []);

  const ticketPickerBottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handleTicketPickerPresentModalPress = useCallback(() => {
    ticketsInfoBottomSheetModalRef.current?.dismiss();
    ticketPickerBottomSheetModalRef.current?.present();
  }, []);

  const {width: screenWidth, height: screenHeight} = useWindowDimensions();

  const fabricJson = JSON.parse(eventShow.seatmap!);

  const sendMessage = (type: string) => {
    webviewRef.current?.postMessage(JSON.stringify({type}));
  };

  const showDetails = () => {
    handleTicketsInfoPresentModalPress();
  };

  const getTickets = () => {
    return eventShow.tickets;
  };

  const onTicketSelect = (fabricObject: any) => {
    if (fabricObject.areaType !== 'ticket') {
      toast.show('Đây không phải khu vực chọn vé', {
        message: 'Vui lòng thực hiện lại thao tác chọn vé.',
        customData: {
          theme: 'yellow',
        },
      });
      return;
    }
    const seatmapBlockId = fabricObject.ticketTypeId;
    const ticket = eventShow.tickets.find(
      t => t.seatmap_block_id === seatmapBlockId,
    );
    if (!ticket) {
      toast.show('Loại vé không tồn tại', {
        message: 'Vui lòng thực hiện lại thao tác chọn vé.',
        customData: {
          theme: 'red',
        },
      });
      return;
    }
    if (ticket.stock <= 0) {
      toast.show('Đã hết vé', {
        message: 'Vui lòng chọn loại vé khác.',
        customData: {
          theme: 'red',
        },
      });
      return;
    }
    setSelectedTicket(ticket.id);
    handleTicketPickerPresentModalPress();
  };

  useEffect(() => {
    if (isWebviewLoaded) {
      webviewRef.current?.postMessage(
        JSON.stringify({
          type: 'init',
          json: fabricJson,
          tickets: eventShow.tickets,
          screenWidth,
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventShow, isWebviewLoaded]);

  return (
    <>
      <Stack flex={1} width={'100%'} position="relative">
        <YStack position="absolute" top={16} right={16} zIndex={1} gap={'$2'}>
          <Button
            circular
            theme="yellow"
            themeInverse
            onPress={() => {
              showDetails();
            }}
            icon={<Tickets size={16} />}
          />
          <Button
            circular
            onPress={() => sendMessage('ZOOM_IN')}
            icon={<Plus size={16} />}
          />
          <Button
            circular
            onPress={() => sendMessage('ZOOM_RESET')}
            icon={<Undo2 size={16} />}
          />
          <Button
            circular
            onPress={() => sendMessage('ZOOM_OUT')}
            icon={<Minus size={16} />}
          />
        </YStack>
        <WebView
          ref={webviewRef}
          style={{flex: 1, backgroundColor: 'transparent'}}
          originWhitelist={['*']}
          source={{html: WEBVIEW_HTML}}
          onMessage={event => {
            try {
              const ev = JSON.parse(event.nativeEvent.data);
              if (ev.type === 'log') {
                console.log('[WEBVIEW LOG]', ...ev.msg);
              } else if (ev.type === 'error') {
                console.error('[WEBVIEW ERROR]', ev);
              } else if (ev.type === 'OBJECT_CLICK') {
                onTicketSelect(ev.object);
              }
            } catch (e) {
              console.log('[WEBVIEW RAW]', event.nativeEvent.data);
            }
          }}
          onLoadEnd={() => {
            setIsWebviewLoaded(true);
          }}
        />
      </Stack>

      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={ticketPickerBottomSheetModalRef}
          enablePanDownToClose={false}
          containerStyle={{zIndex: 101}}>
          <BottomSheetView
            style={{
              flex: 1,
              minHeight: screenHeight * 0.7,
            }}>
            <YStack
              flex={1}
              width={'100%'}
              paddingHorizontal={24}
              paddingBottom={insets.bottom + 12}>
              <XStack
                alignItems="center"
                position="relative"
                paddingVertical={12}
                width={'100%'}
                justifyContent="center">
                <Text fontSize={'$6'} fontWeight={800}>
                  Chọn vé - {getSelectedTicket()?.name}
                </Text>

                <Button
                  position="absolute"
                  right={-4}
                  onPress={() =>
                    ticketPickerBottomSheetModalRef.current?.dismiss()
                  }
                  circular
                  icon={<X size={16} />}
                />
              </XStack>
              <YStack gap={16} marginTop={16} flex={1}>
                {getSelectedTicket() !== undefined && (
                  <Stack key={'OrderInput' + getSelectedTicket()!.id}>
                    <XStack justifyContent="space-between" alignItems="center">
                      <YStack>
                        <Text fontSize={'$6'} fontWeight={'700'}>
                          {getSelectedTicket()!.name}
                        </Text>
                        <Text
                          fontSize={'$5'}
                          fontWeight={'700'}
                          color={'darkgreen'}>
                          {priceFormat(getSelectedTicket()!.price)}
                        </Text>
                        {getSelectedTicket()!.stock > 0 ? (
                          <Text
                            fontSize={'$3'}
                            color={'gray'}
                            fontWeight={'500'}>
                            Còn {getSelectedTicket()!.stock} vé
                          </Text>
                        ) : (
                          <Text color={'red'} fontSize={'$3'}>
                            Hết vé
                          </Text>
                        )}
                      </YStack>
                      {getSelectedTicket()!.stock > 0 && (
                        <Stack alignItems="center" justifyContent="center">
                          <QuantityInput
                            value={getTicketValue(getSelectedTicket()!.id)}
                            onChange={quantity => {
                              setQuantity(getSelectedTicket()!.id, quantity);
                            }}
                            maxValue={getSelectedTicket()!.stock}
                            minValue={0}
                            disabled={getSelectedTicket()!.stock <= 0}
                          />
                        </Stack>
                      )}
                    </XStack>
                  </Stack>
                )}
              </YStack>
            </YStack>
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>

      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={ticketsInfoBottomSheetModalRef}
          containerStyle={{zIndex: 100}}>
          <BottomSheetView
            style={{
              flex: 1,
            }}>
            <YStack
              flex={1}
              width={'100%'}
              paddingHorizontal={24}
              paddingBottom={insets.bottom + 12}>
              <XStack
                alignItems="center"
                position="relative"
                paddingVertical={12}
                width={'100%'}
                justifyContent="center">
                <Text fontSize={'$6'} fontWeight={800}>
                  Thông tin vé
                </Text>

                <Button
                  position="absolute"
                  right={-4}
                  onPress={() =>
                    ticketsInfoBottomSheetModalRef.current?.dismiss()
                  }
                  circular
                  icon={<X size={16} />}
                />
              </XStack>
              <YStack gap={16} marginTop={16}>
                {getTickets().map(ticket => (
                  <Stack key={'OrderInputs' + ticket.id}>
                    <XStack justifyContent="space-between" alignItems="center">
                      <YStack>
                        <Text fontSize={'$6'} fontWeight={'700'}>
                          {ticket.name}
                        </Text>
                        {ticket.stock > 0 ? (
                          <Text
                            fontSize={'$3'}
                            color={'gray'}
                            fontWeight={'500'}>
                            Còn {ticket.stock} vé
                          </Text>
                        ) : (
                          <Text color={'red'} fontSize={'$3'}>
                            Hết vé
                          </Text>
                        )}
                      </YStack>
                      <Text
                        fontSize={'$5'}
                        fontWeight={'700'}
                        color={'darkgreen'}>
                        {priceFormat(ticket.price)}
                      </Text>
                    </XStack>
                    <Separator borderWidth={1} marginTop={12} />
                  </Stack>
                ))}
              </YStack>
            </YStack>
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </>
  );
}
