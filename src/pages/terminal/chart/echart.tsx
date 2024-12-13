import React, { useEffect, useRef } from 'react'

import { Box, useTheme, useColorMode } from '@chakra-ui/react'
import * as echarts from 'echarts'

import useWindow from '../../../hooks/useWindow'
import { DataItem } from '../../../types'
import { calculateMinMax } from '../../../utils/calculationsUtils'

interface Props {
  data: DataItem[]
  volumeAxis: string | undefined
}

const AuctionsEChart: React.FC<Props> = ({ data, volumeAxis }) => {
  const theme = useTheme()
  const { colorMode } = useColorMode()
  const { getWindowSize } = useWindow()
  const { width } = getWindowSize()
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const chartInstance = echarts.init(chartRef.current)

    const prices = data.map((item) => item.price ?? 0)
    const volumes = data.map((item) => item.volume ?? 0)
    const timestamps = data.map((item) => new Date(item.datetime).toISOString())

    const { minValue: minPriceValue, maxValue: maxPriceValue } =
      calculateMinMax(prices)

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: theme.colors.grey['900'],
        textStyle: {
          color: theme.colors.grey['50'],
        },
        borderWidth: 0,
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: 'transparent',
            width: 0,
          },
          label: {
            formatter: (params: { value: string | number | Date }) => {
              return new Date(params.value).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
            },
          },
        },
      },
      legend: {
        data: ['Price', 'Volume'],
        textStyle: {
          color:
            colorMode === 'dark'
              ? theme.colors.grey['200']
              : theme.colors.grey['900'],
        },
      },
      grid: [
        {
          top: '4%',
          height: '82%',
        },
        {
          top: '80%',
          height: '10%',
        },
      ],
      xAxis: [
        {
          type: 'time',
          data: timestamps,
          axisLabel: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          gridIndex: 0,
        },
        {
          type: 'time',
          data: timestamps,
          axisLabel: {
            formatter: (value: string) =>
              new Date(value).toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
              }),
            color:
              colorMode === 'dark'
                ? theme.colors.grey['200']
                : theme.colors.grey['900'],
          },
          axisLine: {
            lineStyle: {
              color:
                colorMode === 'dark'
                  ? theme.colors.grey['400']
                  : theme.colors.grey['700'],
            },
          },
          gridIndex: 1,
        },
      ],
      yAxis: [
        {
          type: 'value',
          position: 'left',
          min: minPriceValue,
          max: maxPriceValue,
          axisLabel: {
            formatter: (value: number) => {
              const decimals = data.length ? (data[0].priceDigitsLimit ?? 2) : 0
              return Number(value).toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: decimals,
              })
            },
            color:
              colorMode === 'dark'
                ? theme.colors.grey['200']
                : theme.colors.grey['900'],
          },
          splitLine: {
            show: false,
          },
          gridIndex: 0,
        },
        {
          type: 'value',
          position: 'left',
          axisLabel: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          gridIndex: 1,
        },
      ],
      series: [
        {
          name: 'Price',
          type: 'line',
          data: prices.map((price, index) => ({
            value: [timestamps[index], price],
          })),
          lineStyle: {
            color: theme.colors.yellow['500'],
            width: 2,
          },
          itemStyle: {
            color: theme.colors.yellow['500'],
          },
          xAxisIndex: 0,
          yAxisIndex: 0,
          tooltip: {
            valueFormatter: (value: number) => {
              const decimals = data.length ? (data[0].priceDigitsLimit ?? 2) : 0
              return Number(value).toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: decimals,
              })
            },
          },
        },
        {
          name: 'Volume',
          type: 'bar',
          data: volumes.map((volume, index) => ({
            value: [timestamps[index], volume],
          })),
          barWidth: '50%',
          itemStyle: {
            color: theme.colors.blue['500'],
          },
          xAxisIndex: 1,
          yAxisIndex: 1,
          tooltip: {
            valueFormatter: (value: number) => {
              const decimals = data.length ? (data[0].volumeDecimals ?? 2) : 0
              return Number(value).toFixed(decimals)
            },
          },
        },
      ],
    }

    chartInstance.setOption(option)

    return () => {
      chartInstance.dispose()
    }
  }, [data, colorMode, theme, volumeAxis, width])

  return <Box position="relative" ref={chartRef} h="30vh" />
}

export default AuctionsEChart
