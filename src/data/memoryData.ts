export interface BitField {
  name: string
  startBit: number
  endBit: number
  description: string
  access: 'r' | 'w' | 'rw' | 'rt_w' | 'r_w' | 'res' // res for reserved
}

export interface MemoryRegion {
  id: string
  name: string
  start: string
  end: string
  description?: string
  children?: MemoryRegion[]
  color?: string
  type?: 'block' | 'region' | 'peripheral' | 'reserved' | 'register'
  // 视觉属性：基础高度权重，用于控制显示大小
  heightWeight?: number 
  // 详细信息页面内容
  longDescription?: string
  features?: string[]
  // 寄存器特有属性
  offset?: string
  resetValue?: string
  bitFields?: BitField[]
  size?: 16 | 32
}

// 详细的 STM32F103 内存映射数据
export const memoryData: MemoryRegion[] = [
  {
    id: 'block0',
    name: 'Block 0 - Code',
    start: '0x0000 0000',
    end: '0x1FFF FFFF',
    color: 'var(--ctp-blue)',
    type: 'block',
    heightWeight: 2,
    description: 'Flash, System, Boot',
    longDescription: 'Block 0 is designed for code execution. It contains the Flash memory, System Memory (Bootloader), and Option Bytes. The aliased area allows remapping different boot memories to address 0x0000 0000.',
    features: ['Up to 128KB Flash', 'System Bootloader', 'Option Bytes Configuration'],
    children: [
      { 
        id: 'b0_alias',
        name: 'Aliased Area', 
        start: '0x0000 0000', 
        end: '0x0007 FFFF', 
        description: 'Boot Alias',
        type: 'region',
        heightWeight: 1,
        longDescription: 'Depending on the BOOT pins, this area mirrors either Flash Memory, System Memory, or SRAM, allowing the CPU to boot from different sources.'
      },
      { 
        id: 'b0_reserved_1',
        name: 'Reserved', 
        start: '0x0008 0000', 
        end: '0x07FF FFFF', 
        type: 'reserved',
        heightWeight: 0.5
      },
      { 
        id: 'b0_flash',
        name: 'Flash Memory', 
        start: '0x0800 0000', 
        end: '0x0807 FFFF', 
        color: 'var(--ctp-green)',
        description: 'Main Program',
        type: 'region',
        heightWeight: 2,
        children: [
          { id: 'flash_main', name: 'Main Memory', start: '0x0800 0000', end: '0x0807 FFFF', description: 'User App', heightWeight: 1 },
        ]
      },
      { 
        id: 'b0_reserved_2',
        name: 'Reserved', 
        start: '0x0808 0000', 
        end: '0x1FFF EFFF', 
        type: 'reserved',
        heightWeight: 0.5
      },
      { 
        id: 'b0_system',
        name: 'System Memory', 
        start: '0x1FFF F000', 
        end: '0x1FFF F7FF', 
        color: 'var(--ctp-yellow)',
        description: 'Bootloader',
        type: 'region',
        heightWeight: 1
      },
      { 
        id: 'b0_option',
        name: 'Option Bytes', 
        start: '0x1FFF F800', 
        end: '0x1FFF F80F', 
        description: 'Config',
        type: 'region',
        heightWeight: 1
      },
    ]
  },
  {
    id: 'block1',
    name: 'Block 1 - SRAM',
    start: '0x2000 0000',
    end: '0x3FFF FFFF',
    color: 'var(--ctp-mauve)',
    type: 'block',
    heightWeight: 1.5,
    children: [
      { 
        id: 'b1_sram',
        name: 'SRAM', 
        start: '0x2000 0000', 
        end: '0x2000 FFFF', 
        description: '64KB Internal',
        color: 'var(--ctp-mauve)',
        type: 'region',
        heightWeight: 1.5
      },
      { 
        id: 'b1_reserved_1',
        name: 'Reserved', 
        start: '0x2001 0000', 
        end: '0x21FF FFFF', 
        type: 'reserved',
        heightWeight: 0.5
      },
      { 
        id: 'b1_bb',
        name: 'Bit-band Alias', 
        start: '0x2200 0000', 
        end: '0x23FF FFFF', 
        description: 'Atomic Access',
        type: 'region',
        heightWeight: 1
      },
      { 
        id: 'b1_reserved_2',
        name: 'Reserved', 
        start: '0x2400 0000', 
        end: '0x3FFF FFFF', 
        type: 'reserved',
        heightWeight: 0.5
      }
    ]
  },
  {
    id: 'block2',
    name: 'Block 2 - Peripherals',
    start: '0x4000 0000',
    end: '0x5FFF FFFF',
    color: 'var(--ctp-red)',
    type: 'block',
    heightWeight: 2.5,
    children: [
      { 
        id: 'b2_apb1',
        name: 'APB1 Bus', 
        start: '0x4000 0000', 
        end: '0x4000 77FF', 
        color: 'var(--ctp-maroon)',
        description: 'Low Speed (36MHz)',
        type: 'region',
        heightWeight: 2,
        children: [
          {
            id: 'tim2',
            name: 'TIM2',
            start: '0x4000 0000',
            end: '0x4000 03FF',
            description: 'General Purpose Timer',
            type: 'peripheral',
            longDescription: 'TIM2 is a general-purpose timer consisting of a 16-bit auto-reload counter driven by a programmable prescaler.',
            features: ['16-bit auto-reload counter', '16-bit programmable prescaler', '4 independent channels', 'PWM generation'],
            children: [
              {
                id: 'tim2_cr1',
                name: 'TIMx_CR1',
                start: '0x4000 0000',
                end: '0x4000 0003',
                description: 'Control Register 1',
                type: 'register',
                offset: '0x00',
                resetValue: '0x0000',
                size: 16,
                bitFields: [
                  { name: 'CKD', startBit: 8, endBit: 9, description: 'Clock division', access: 'rw' },
                  { name: 'ARPE', startBit: 7, endBit: 7, description: 'Auto-reload preload enable', access: 'rw' },
                  { name: 'CMS', startBit: 5, endBit: 6, description: 'Center-aligned mode selection', access: 'rw' },
                  { name: 'DIR', startBit: 4, endBit: 4, description: 'Direction', access: 'rw' },
                  { name: 'OPM', startBit: 3, endBit: 3, description: 'One-pulse mode', access: 'rw' },
                  { name: 'URS', startBit: 2, endBit: 2, description: 'Update request source', access: 'rw' },
                  { name: 'UDIS', startBit: 1, endBit: 1, description: 'Update disable', access: 'rw' },
                  { name: 'CEN', startBit: 0, endBit: 0, description: 'Counter enable', access: 'rw' }
                ]
              },
              {
                id: 'tim2_dier',
                name: 'TIMx_DIER',
                start: '0x4000 000C',
                end: '0x4000 000F',
                description: 'DMA/Interrupt Enable',
                type: 'register',
                offset: '0x0C',
                resetValue: '0x0000',
                size: 16,
                bitFields: [
                  { name: 'TDE', startBit: 14, endBit: 14, description: 'Trigger DMA request enable', access: 'rw' },
                  { name: 'CC4DE', startBit: 12, endBit: 12, description: 'Capture/Compare 4 DMA request enable', access: 'rw' },
                  { name: 'CC3DE', startBit: 11, endBit: 11, description: 'Capture/Compare 3 DMA request enable', access: 'rw' },
                  { name: 'CC2DE', startBit: 10, endBit: 10, description: 'Capture/Compare 2 DMA request enable', access: 'rw' },
                  { name: 'CC1DE', startBit: 9, endBit: 9, description: 'Capture/Compare 1 DMA request enable', access: 'rw' },
                  { name: 'UDE', startBit: 8, endBit: 8, description: 'Update DMA request enable', access: 'rw' },
                  { name: 'TIE', startBit: 6, endBit: 6, description: 'Trigger interrupt enable', access: 'rw' },
                  { name: 'CC4IE', startBit: 4, endBit: 4, description: 'Capture/Compare 4 interrupt enable', access: 'rw' },
                  { name: 'CC3IE', startBit: 3, endBit: 3, description: 'Capture/Compare 3 interrupt enable', access: 'rw' },
                  { name: 'CC2IE', startBit: 2, endBit: 2, description: 'Capture/Compare 2 interrupt enable', access: 'rw' },
                  { name: 'CC1IE', startBit: 1, endBit: 1, description: 'Capture/Compare 1 interrupt enable', access: 'rw' },
                  { name: 'UIE', startBit: 0, endBit: 0, description: 'Update interrupt enable', access: 'rw' }
                ]
              }
            ]
          },
          { id: 'tim3', name: 'TIM3', start: '0x4000 0400', end: '0x4000 07FF', longDescription: 'General purpose timer. Similar to TIM2.', features: ['16-bit counter', '4 channels'] },
          { id: 'tim4', name: 'TIM4', start: '0x4000 0800', end: '0x4000 0BFF', longDescription: 'General purpose timer.', features: ['16-bit counter', '4 channels'] },
          { id: 'rtc', name: 'RTC/BKP', start: '0x4000 2800', end: '0x4000 2BFF', longDescription: 'Real-Time Clock and Backup Registers. Powered by Vbat.', features: ['32-bit counter', 'Alarm interrupt', '42 16-bit backup registers'] },
          { id: 'wwdg', name: 'WWDG', start: '0x4000 2C00', end: '0x4000 2FFF', longDescription: 'Window Watchdog. Detects software faults.', features: ['7-bit downcounter', 'Early wakeup interrupt'] },
          { id: 'iwdg', name: 'IWDG', start: '0x4000 3000', end: '0x4000 33FF', longDescription: 'Independent Watchdog. Clocked by LSI.', features: ['12-bit downcounter', 'Reset generation'] },
          { id: 'spi2', name: 'SPI2', start: '0x4000 3800', end: '0x4000 3BFF', longDescription: 'Serial Peripheral Interface 2.', features: ['Full-duplex', 'Master/Slave', 'CRC calculation'] },
          { id: 'usart2', name: 'USART2', start: '0x4000 4400', end: '0x4000 47FF', longDescription: 'Universal Synchronous Asynchronous Receiver Transmitter 2.', features: ['NRZ standard', 'LIN', 'IrDA'] },
          { id: 'usart3', name: 'USART3', start: '0x4000 4800', end: '0x4000 4BFF', longDescription: 'USART3 interface.', features: ['NRZ standard', 'LIN', 'IrDA'] },
          { id: 'i2c1', name: 'I2C1', start: '0x4000 5400', end: '0x4000 57FF', longDescription: 'Inter-integrated Circuit Interface 1.', features: ['Standard/Fast mode', 'SMBus', 'PMBus'] },
          { id: 'i2c2', name: 'I2C2', start: '0x4000 5800', end: '0x4000 5BFF', longDescription: 'I2C2 interface.', features: ['Standard/Fast mode', 'SMBus'] },
          { id: 'usb', name: 'USB', start: '0x4000 5C00', end: '0x4000 5FFF', longDescription: 'Universal Serial Bus Full-Speed Device interface.', features: ['USB 2.0 FS', '512 bytes buffer', '8 endpoints'] },
          { id: 'can', name: 'CAN', start: '0x4000 6400', end: '0x4000 67FF', longDescription: 'Controller Area Network interface.', features: ['CAN 2.0B Active', '1Mbit/s', '3 transmit mailboxes'] },
          { id: 'pwr', name: 'PWR', start: '0x4000 7000', end: '0x4000 73FF', longDescription: 'Power control register.', features: ['PVD', 'Wakeup logic', 'Backup domain access'] },
          { id: 'dac', name: 'DAC', start: '0x4000 7400', end: '0x4000 77FF', longDescription: 'Digital to Analog Converter.', features: ['2 channels', '12-bit', 'Noise generation'] },
        ]
      },
      { 
        id: 'b2_reserved_1',
        name: 'Reserved', 
        start: '0x4000 7800', 
        end: '0x4000 FFFF', 
        type: 'reserved',
        heightWeight: 0.5
      },
      { 
        id: 'b2_apb2',
        name: 'APB2 Bus', 
        start: '0x4001 0000', 
        end: '0x4001 3FFF', 
        color: 'var(--ctp-peach)',
        description: 'High Speed (72MHz)',
        type: 'region',
        heightWeight: 2,
        children: [
          { id: 'afio', name: 'AFIO', start: '0x4001 0000', end: '0x4001 03FF', longDescription: 'Alternate Function I/O. Remaps peripheral pins.', features: ['EXTI configuration', 'Eventout', 'Remap control'] },
          { id: 'exti', name: 'EXTI', start: '0x4001 0400', end: '0x4001 07FF', longDescription: 'External Interrupt/Event Controller.', features: ['19 edge detectors', 'Wakeup event generation'] },
          { 
            id: 'gpioa', 
            name: 'GPIOA', 
            start: '0x4001 0800', 
            end: '0x4001 0BFF', 
            longDescription: 'General Purpose I/O Port A. Controls 16 I/O pins.', 
            features: ['16 pins', 'Push-pull/Open-drain', 'Speed control'],
            children: [
              { id: 'gpioa_crl', name: 'CRL', start: 'Offset: 0x00', end: '32-bit', description: 'Port Configuration Register Low', longDescription: 'Configures pins 0-7 (Mode and CNF bits).', features: ['Mode: Input/Output', 'CNF: Push-pull/Open-drain/Analog'] },
              { id: 'gpioa_crh', name: 'CRH', start: 'Offset: 0x04', end: '32-bit', description: 'Port Configuration Register High', longDescription: 'Configures pins 8-15 (Mode and CNF bits).', features: ['Mode: Input/Output', 'CNF: Push-pull/Open-drain/Analog'] },
              { id: 'gpioa_idr', name: 'IDR', start: 'Offset: 0x08', end: '32-bit', description: 'Port Input Data Register', longDescription: 'Read-only register containing the input value of the corresponding I/O port.', features: ['Read-only', 'Reflects pin state'] },
              { id: 'gpioa_odr', name: 'ODR', start: 'Offset: 0x0C', end: '32-bit', description: 'Port Output Data Register', longDescription: 'Read/Write register. Writing to this register sets the output value of the pins.', features: ['Read/Write', 'Sets output level'] },
              { id: 'gpioa_bsrr', name: 'BSRR', start: 'Offset: 0x10', end: '32-bit', description: 'Port Bit Set/Reset Register', longDescription: 'Atomic set/reset of ODR bits. Write 1 to set or reset.', features: ['Atomic operation', 'No read-modify-write needed'] },
              { id: 'gpioa_brr', name: 'BRR', start: 'Offset: 0x14', end: '32-bit', description: 'Port Bit Reset Register', longDescription: 'Atomic reset of ODR bits. Write 1 to reset.', features: ['Atomic reset'] },
              { id: 'gpioa_lckr', name: 'LCKR', start: 'Offset: 0x18', end: '32-bit', description: 'Port Configuration Lock Register', longDescription: 'Locks the configuration of the port bits until next reset.', features: ['Prevents accidental config changes'] },
            ]
          },
          { 
            id: 'gpiob', 
            name: 'GPIOB', 
            start: '0x4001 0C00', 
            end: '0x4001 0FFF', 
            longDescription: 'General Purpose I/O Port B.', 
            features: ['16 pins', 'Push-pull/Open-drain'],
            children: [
              { id: 'gpiob_crl', name: 'CRL', start: 'Offset: 0x00', end: '32-bit', description: 'Port Configuration Register Low', longDescription: 'Configures pins 0-7 (Mode and CNF bits).', features: ['Mode: Input/Output', 'CNF: Push-pull/Open-drain/Analog'] },
              { id: 'gpiob_crh', name: 'CRH', start: 'Offset: 0x04', end: '32-bit', description: 'Port Configuration Register High', longDescription: 'Configures pins 8-15 (Mode and CNF bits).', features: ['Mode: Input/Output', 'CNF: Push-pull/Open-drain/Analog'] },
              { id: 'gpiob_idr', name: 'IDR', start: 'Offset: 0x08', end: '32-bit', description: 'Port Input Data Register', longDescription: 'Read-only register containing the input value of the corresponding I/O port.', features: ['Read-only', 'Reflects pin state'] },
              { id: 'gpiob_odr', name: 'ODR', start: 'Offset: 0x0C', end: '32-bit', description: 'Port Output Data Register', longDescription: 'Read/Write register. Writing to this register sets the output value of the pins.', features: ['Read/Write', 'Sets output level'] },
              { id: 'gpiob_bsrr', name: 'BSRR', start: 'Offset: 0x10', end: '32-bit', description: 'Port Bit Set/Reset Register', longDescription: 'Atomic set/reset of ODR bits. Write 1 to set or reset.', features: ['Atomic operation', 'No read-modify-write needed'] },
              { id: 'gpiob_brr', name: 'BRR', start: 'Offset: 0x14', end: '32-bit', description: 'Port Bit Reset Register', longDescription: 'Atomic reset of ODR bits. Write 1 to reset.', features: ['Atomic reset'] },
              { id: 'gpiob_lckr', name: 'LCKR', start: 'Offset: 0x18', end: '32-bit', description: 'Port Configuration Lock Register', longDescription: 'Locks the configuration of the port bits until next reset.', features: ['Prevents accidental config changes'] },
            ]
          },
          {
            id: 'gpioc',
            name: 'GPIOC',
            start: '0x4001 1000',
            end: '0x4001 13FF',
            description: 'General Purpose I/O',
            type: 'peripheral',
            longDescription: 'General Purpose Input/Output Port C. Controls pins PC0-PC15.',
            features: ['Output Data Register (ODR)', 'Input Data Register (IDR)', 'Configuration Registers'],
            children: [
              {
                id: 'gpioc_crl',
                name: 'GPIOx_CRL',
                start: '0x4001 1000',
                end: '0x4001 1003',
                description: 'Port configuration low',
                type: 'register',
                offset: '0x00',
                resetValue: '0x4444 4444',
                size: 32,
                bitFields: [
                  { name: 'CNF7', startBit: 30, endBit: 31, description: 'Pin 7 config', access: 'rw' },
                  { name: 'MODE7', startBit: 28, endBit: 29, description: 'Pin 7 mode', access: 'rw' },
                  { name: 'CNF0', startBit: 2, endBit: 3, description: 'Pin 0 config', access: 'rw' },
                  { name: 'MODE0', startBit: 0, endBit: 1, description: 'Pin 0 mode', access: 'rw' }
                ]
              },
              {
                id: 'gpioc_odr',
                name: 'GPIOx_ODR',
                start: '0x4001 100C',
                end: '0x4001 100F',
                description: 'Port output data',
                type: 'register',
                offset: '0x0C',
                resetValue: '0x0000 0000',
                size: 32,
                bitFields: [
                  { name: 'Reserved', startBit: 16, endBit: 31, description: 'Reserved', access: 'res' },
                  { name: 'ODR15', startBit: 15, endBit: 15, description: 'Port output data bit 15', access: 'rw' },
                  { name: 'ODR14', startBit: 14, endBit: 14, description: 'Port output data bit 14', access: 'rw' },
                  { name: 'ODR13', startBit: 13, endBit: 13, description: 'Port output data bit 13', access: 'rw' },
                  { name: 'ODR12', startBit: 12, endBit: 12, description: 'Port output data bit 12', access: 'rw' },
                  { name: 'ODR11', startBit: 11, endBit: 11, description: 'Port output data bit 11', access: 'rw' },
                  { name: 'ODR10', startBit: 10, endBit: 10, description: 'Port output data bit 10', access: 'rw' },
                  { name: 'ODR9', startBit: 9, endBit: 9, description: 'Port output data bit 9', access: 'rw' },
                  { name: 'ODR8', startBit: 8, endBit: 8, description: 'Port output data bit 8', access: 'rw' },
                  { name: 'ODR7', startBit: 7, endBit: 7, description: 'Port output data bit 7', access: 'rw' },
                  { name: 'ODR6', startBit: 6, endBit: 6, description: 'Port output data bit 6', access: 'rw' },
                  { name: 'ODR5', startBit: 5, endBit: 5, description: 'Port output data bit 5', access: 'rw' },
                  { name: 'ODR4', startBit: 4, endBit: 4, description: 'Port output data bit 4', access: 'rw' },
                  { name: 'ODR3', startBit: 3, endBit: 3, description: 'Port output data bit 3', access: 'rw' },
                  { name: 'ODR2', startBit: 2, endBit: 2, description: 'Port output data bit 2', access: 'rw' },
                  { name: 'ODR1', startBit: 1, endBit: 1, description: 'Port output data bit 1', access: 'rw' },
                  { name: 'ODR0', startBit: 0, endBit: 0, description: 'Port output data bit 0', access: 'rw' }
                ]
              }
            ]
          },
          { 
            id: 'gpiod', 
            name: 'GPIOD', 
            start: '0x4001 1400', 
            end: '0x4001 17FF', 
            longDescription: 'General Purpose I/O Port D.', 
            features: ['16 pins', 'Push-pull/Open-drain'],
            children: [
              { id: 'gpiod_crl', name: 'CRL', start: 'Offset: 0x00', end: '32-bit', description: 'Port Configuration Register Low', longDescription: 'Configures pins 0-7.', features: ['Mode: Input/Output', 'CNF: Push-pull/Open-drain/Analog'] },
              { id: 'gpiod_crh', name: 'CRH', start: 'Offset: 0x04', end: '32-bit', description: 'Port Configuration Register High', longDescription: 'Configures pins 8-15.', features: ['Mode: Input/Output', 'CNF: Push-pull/Open-drain/Analog'] },
              { id: 'gpiod_idr', name: 'IDR', start: 'Offset: 0x08', end: '32-bit', description: 'Port Input Data Register', longDescription: 'Read-only input data.', features: ['Read-only'] },
              { id: 'gpiod_odr', name: 'ODR', start: 'Offset: 0x0C', end: '32-bit', description: 'Port Output Data Register', longDescription: 'Read/Write output data.', features: ['Read/Write'] },
              { id: 'gpiod_bsrr', name: 'BSRR', start: 'Offset: 0x10', end: '32-bit', description: 'Port Bit Set/Reset Register', longDescription: 'Atomic set/reset.', features: ['Atomic operation'] },
              { id: 'gpiod_brr', name: 'BRR', start: 'Offset: 0x14', end: '32-bit', description: 'Port Bit Reset Register', longDescription: 'Atomic reset.', features: ['Atomic reset'] },
              { id: 'gpiod_lckr', name: 'LCKR', start: 'Offset: 0x18', end: '32-bit', description: 'Port Configuration Lock Register', longDescription: 'Locks configuration.', features: ['Lock mechanism'] },
            ]
          },
          { 
            id: 'gpioe', 
            name: 'GPIOE', 
            start: '0x4001 1800', 
            end: '0x4001 1BFF', 
            longDescription: 'General Purpose I/O Port E.', 
            features: ['16 pins', 'Push-pull/Open-drain'],
            children: [
              { id: 'gpioe_crl', name: 'CRL', start: 'Offset: 0x00', end: '32-bit', description: 'Port Configuration Register Low', longDescription: 'Configures pins 0-7.', features: ['Mode: Input/Output', 'CNF: Push-pull/Open-drain/Analog'] },
              { id: 'gpioe_crh', name: 'CRH', start: 'Offset: 0x04', end: '32-bit', description: 'Port Configuration Register High', longDescription: 'Configures pins 8-15.', features: ['Mode: Input/Output', 'CNF: Push-pull/Open-drain/Analog'] },
              { id: 'gpioe_idr', name: 'IDR', start: 'Offset: 0x08', end: '32-bit', description: 'Port Input Data Register', longDescription: 'Read-only input data.', features: ['Read-only'] },
              { id: 'gpioe_odr', name: 'ODR', start: 'Offset: 0x0C', end: '32-bit', description: 'Port Output Data Register', longDescription: 'Read/Write output data.', features: ['Read/Write'] },
              { id: 'gpioe_bsrr', name: 'BSRR', start: 'Offset: 0x10', end: '32-bit', description: 'Port Bit Set/Reset Register', longDescription: 'Atomic set/reset.', features: ['Atomic operation'] },
              { id: 'gpioe_brr', name: 'BRR', start: 'Offset: 0x14', end: '32-bit', description: 'Port Bit Reset Register', longDescription: 'Atomic reset.', features: ['Atomic reset'] },
              { id: 'gpioe_lckr', name: 'LCKR', start: 'Offset: 0x18', end: '32-bit', description: 'Port Configuration Lock Register', longDescription: 'Locks configuration.', features: ['Lock mechanism'] },
            ]
          },
          { id: 'adc1', name: 'ADC1', start: '0x4001 2400', end: '0x4001 27FF', longDescription: 'Analog to Digital Converter 1.', features: ['12-bit resolution', '1us conversion', 'DMA support'] },
          { id: 'adc2', name: 'ADC2', start: '0x4001 2800', end: '0x4001 2BFF', longDescription: 'Analog to Digital Converter 2.', features: ['12-bit resolution', 'Dual mode with ADC1'] },
          { id: 'tim1', name: 'TIM1', start: '0x4001 2C00', end: '0x4001 2FFF', longDescription: 'Advanced Control Timer.', features: ['16-bit', 'Dead-time insertion', 'Motor control'] },
          { id: 'spi1', name: 'SPI1', start: '0x4001 3000', end: '0x4001 33FF', longDescription: 'Serial Peripheral Interface 1.', features: ['High speed', 'Full-duplex'] },
          { 
            id: 'usart1', 
            name: 'USART1', 
            start: '0x4001 3800', 
            end: '0x4001 3BFF', 
            longDescription: 'Universal Synchronous Asynchronous Receiver Transmitter 1. High speed interface.', 
            features: ['High speed', 'Smartcard mode', 'IrDA', 'LIN'],
            children: [
              { id: 'usart1_sr', name: 'SR', start: 'Offset: 0x00', end: '32-bit', description: 'Status Register', longDescription: 'Flags for various USART events.', features: ['TXE (Transmit Empty)', 'RXNE (Read Data Not Empty)', 'TC (Transmission Complete)'] },
              { id: 'usart1_dr', name: 'DR', start: 'Offset: 0x04', end: '32-bit', description: 'Data Register', longDescription: 'Contains the received or transmitted data character.', features: ['9-bit or 8-bit data', 'Read for RX, Write for TX'] },
              { id: 'usart1_brr', name: 'BRR', start: 'Offset: 0x08', end: '32-bit', description: 'Baud Rate Register', longDescription: 'Stores the division factor for the baud rate generator.', features: ['Mantissa (12-bit)', 'Fraction (4-bit)'] },
              { id: 'usart1_cr1', name: 'CR1', start: 'Offset: 0x0C', end: '32-bit', description: 'Control Register 1', longDescription: 'Main control register for USART.', features: ['UE (USART Enable)', 'TE/RE (Transmitter/Receiver Enable)', 'RXNEIE/TXEIE (Interrupts)'] },
              { id: 'usart1_cr2', name: 'CR2', start: 'Offset: 0x10', end: '32-bit', description: 'Control Register 2', longDescription: 'Configuration for STOP bits and clock.', features: ['STOP bits', 'CLKEN (Clock Enable)'] },
              { id: 'usart1_cr3', name: 'CR3', start: 'Offset: 0x14', end: '32-bit', description: 'Control Register 3', longDescription: 'Configuration for DMA and hardware flow control.', features: ['DMAT/DMAR (DMA Enable)', 'CTSE/RTSE (Flow Control)'] },
              { id: 'usart1_gtpr', name: 'GTPR', start: 'Offset: 0x18', end: '32-bit', description: 'Guard Time and Prescaler', longDescription: 'Used for Smartcard mode.', features: ['PSC (Prescaler)', 'GT (Guard Time)'] },
            ]
          },
        ]
      },
      { 
        id: 'b2_reserved_2',
        name: 'Reserved', 
        start: '0x4001 4000', 
        end: '0x4001 7FFF', 
        type: 'reserved',
        heightWeight: 0.5
      },
      { 
        id: 'b2_ahb',
        name: 'AHB Bus', 
        start: '0x4001 8000', 
        end: '0x5003 FFFF', 
        color: 'var(--ctp-teal)',
        description: 'High Perf',
        type: 'region',
        heightWeight: 1.5,
        children: [
          { id: 'dma1', name: 'DMA1', start: '0x4002 0000', end: '0x4002 03FF' },
          { id: 'dma2', name: 'DMA2', start: '0x4002 0400', end: '0x4002 07FF' },
          { 
            id: 'rcc', 
            name: 'RCC', 
            start: '0x4002 1000', 
            end: '0x4002 13FF',
            longDescription: 'Reset and Clock Control. Manages the system clock generation and distribution.',
            features: ['System Clock (SYSCLK)', 'Peripheral Clocks', 'Reset Control'],
            children: [
              { id: 'rcc_cr', name: 'CR', start: 'Offset: 0x00', end: '32-bit', description: 'Clock Control Register', longDescription: 'HSI, HSE, PLL clock enable and ready flags.', features: ['HSI ON/OFF', 'HSE ON/OFF', 'PLL ON/OFF'] },
              { id: 'rcc_cfgr', name: 'CFGR', start: 'Offset: 0x04', end: '32-bit', description: 'Clock Configuration Register', longDescription: 'Configures system clock source, AHB/APB prescalers.', features: ['SW (System Clock Switch)', 'HPRE (AHB Prescaler)', 'PPRE1/2 (APB Prescalers)'] },
              { id: 'rcc_cir', name: 'CIR', start: 'Offset: 0x08', end: '32-bit', description: 'Clock Interrupt Register', longDescription: 'Manages clock interrupts (LSI/LSE/HSI/HSE/PLL ready).', features: ['Clock Ready Interrupts', 'Clear Flags'] },
              { id: 'rcc_apb2rstr', name: 'APB2RSTR', start: 'Offset: 0x0C', end: '32-bit', description: 'APB2 Peripheral Reset Register', longDescription: 'Resets peripherals on APB2 bus.', features: ['GPIO Reset', 'ADC Reset', 'SPI1/USART1 Reset'] },
              { id: 'rcc_apb1rstr', name: 'APB1RSTR', start: 'Offset: 0x10', end: '32-bit', description: 'APB1 Peripheral Reset Register', longDescription: 'Resets peripherals on APB1 bus.', features: ['TIM2-4 Reset', 'WWDG Reset', 'SPI2/USART2/3 Reset'] },
              { id: 'rcc_ahbenr', name: 'AHBENR', start: 'Offset: 0x14', end: '32-bit', description: 'AHB Peripheral Clock Enable', longDescription: 'Enables clock for AHB peripherals.', features: ['DMA1/2 EN', 'SRAM EN', 'FLITF EN'] },
              { id: 'rcc_apb2enr', name: 'APB2ENR', start: 'Offset: 0x18', end: '32-bit', description: 'APB2 Peripheral Clock Enable', longDescription: 'Enables clock for APB2 peripherals.', features: ['AFIO EN', 'GPIO A-E EN', 'ADC1/2 EN'] },
              { id: 'rcc_apb1enr', name: 'APB1ENR', start: 'Offset: 0x1C', end: '32-bit', description: 'APB1 Peripheral Clock Enable', longDescription: 'Enables clock for APB1 peripherals.', features: ['TIM2-4 EN', 'WWDG EN', 'SPI2/USART2/3 EN'] },
              { id: 'rcc_bdcr', name: 'BDCR', start: 'Offset: 0x20', end: '32-bit', description: 'Backup Domain Control', longDescription: 'Configures the LSE oscillator and RTC clock source.', features: ['LSE ON/OFF', 'RTCSEL', 'RTCEN'] },
              { id: 'rcc_csr', name: 'CSR', start: 'Offset: 0x24', end: '32-bit', description: 'Control/Status Register', longDescription: 'LSI control and Reset flags.', features: ['LSION', 'RMVF (Remove Reset Flags)', 'Reset Source Flags'] },
            ]
          },
          { id: 'flash_if', name: 'Flash Interface', start: '0x4002 2000', end: '0x4002 23FF' },
          { id: 'crc', name: 'CRC', start: '0x4002 3000', end: '0x4002 33FF' },
          { id: 'fsmc', name: 'FSMC', start: '0xA000 0000', end: '0xA000 0FFF', description: 'Flexible Static Memory Controller' },
        ]
      }
    ]
  },
  {
    id: 'block3_5',
    name: 'Block 3-5',
    start: '0x6000 0000',
    end: '0x9FFF FFFF',
    color: 'var(--ctp-surface2)',
    type: 'reserved',
    description: 'Reserved',
    heightWeight: 1
  },
  {
    id: 'block6',
    name: 'Block 6',
    start: '0xA000 0000',
    end: '0xBFFF FFFF',
    color: 'var(--ctp-surface2)',
    type: 'reserved',
    description: 'Reserved',
    heightWeight: 1
  },
  {
    id: 'block7',
    name: 'Block 7 - Cortex-M3',
    start: '0xE000 0000',
    end: '0xFFFF FFFF',
    color: 'var(--ctp-lavender)',
    type: 'block',
    heightWeight: 1.5,
    children: [
      { id: 'itm', name: 'ITM', start: '0xE000 0000', end: '0xE000 0FFF' },
      { id: 'dwt', name: 'DWT', start: '0xE000 1000', end: '0xE000 1FFF' },
      { id: 'fpb', name: 'FPB', start: '0xE000 2000', end: '0xE000 2FFF' },
      { id: 'nvic', name: 'NVIC', start: '0xE000 E100', end: '0xE000 E4EF' },
      { id: 'scb', name: 'SCB', start: '0xE000 ED00', end: '0xE000 ED3F' },
      { id: 'systick', name: 'SysTick', start: '0xE000 E010', end: '0xE000 E01F' },
    ]
  }
]
