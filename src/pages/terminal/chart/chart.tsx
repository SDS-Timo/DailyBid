import React, { useEffect, useRef } from 'react'
import 'chartjs-adapter-date-fns'

import { Box, useTheme, useColorMode } from '@chakra-ui/react'
import Chart from 'chart.js/auto'

import { DataItem } from '../../../types'
import { calculateMinMax } from '../../../utils/calculationsUtils'

interface Props {
  data: DataItem[]
  volumeAxis: string | undefined
}

const AuctionsChart: React.FC<Props> = ({ data, volumeAxis }) => {
  const theme = useTheme()
  const { colorMode } = useColorMode()
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstanceRef = useRef<Chart | null>(null)

  useEffect(() => {
    const ctx = chartRef.current?.getContext('2d')
    if (!ctx) {
      console.error('Failed to get 2D context from canvas')
      return
    }

    // Destroy any existing chart instance to avoid memory leaks
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }

    const prices = data.map((item: DataItem) => item.price ?? 0)
    const { minValue, maxValue } = calculateMinMax(prices)

    // Create the chart instance
    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Price',
            data: data.map((item: DataItem) => ({
              x: new Date(item.datetime).getTime(),
              y: item.price ?? null,
            })),
            borderColor: theme.colors.yellow['500'],
            borderWidth: 2,
            backgroundColor: theme.colors.yellow['500'],
            yAxisID: 'y-price',
          },
          {
            label: 'Volume',
            data: data.map((item: DataItem) => ({
              x: new Date(item.datetime).getTime(),
              y: item.volume ?? null,
            })),
            borderColor: theme.colors.blue['500'],
            borderWidth: 2,
            backgroundColor: theme.colors.blue['500'],
            yAxisID: 'y-volume',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          'y-price': {
            type: 'linear',
            position: 'left',
            beginAtZero: false,
            min: minValue,
            max: maxValue,
            grid: {
              display: false,
            },
            title: {
              display: true,
              text: 'Price',
              color:
                colorMode === 'dark'
                  ? theme.colors.grey['400']
                  : theme.colors.grey['700'],
            },
            ticks: {
              color:
                colorMode === 'dark'
                  ? theme.colors.grey['200']
                  : theme.colors.grey['900'],
              callback: function (value) {
                const decimals = data.length ? data[0].priceDigitsLimit : 0
                return Number(value).toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: decimals,
                })
              },
            },
          },
          'y-volume': {
            type: 'linear',
            position: 'right',
            beginAtZero: true,
            grid: {
              display: false,
            },
            title: {
              display: true,
              text: `Volume ${volumeAxis ?? ''}`,
              color:
                colorMode === 'dark'
                  ? theme.colors.grey['200']
                  : theme.colors.grey['900'],
            },
            ticks: {
              color:
                colorMode === 'dark'
                  ? theme.colors.grey['200']
                  : theme.colors.grey['900'],
              callback: function (value) {
                const decimals = data.length ? data[0].volumeDecimals : 0
                return Number(value).toFixed(decimals)
              },
            },
          },
          x: {
            type: 'time',
            time: {
              unit: 'day',
              tooltipFormat: 'MMM dd',
            },
            grid: {
              display: false,
            },
            ticks: {
              color:
                colorMode === 'dark'
                  ? theme.colors.grey['200']
                  : theme.colors.grey['900'],
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color:
                colorMode === 'dark'
                  ? theme.colors.grey['200']
                  : theme.colors.grey['900'],
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              title(tooltipItems) {
                return data[tooltipItems[0].dataIndex].datetime
              },
              label: function (context) {
                let label = context.dataset.label
                if (label) {
                  label += ': '
                }
                if (context.parsed.y !== null) {
                  if (context.dataset.label === 'Price') {
                    const decimals = data[0].priceDigitsLimit ?? 2
                    const value = context.parsed.y
                    label += Number(value).toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: decimals,
                    })
                  } else if (context.dataset.label === 'Volume') {
                    const volumeDecimals = data[0].volumeDecimals ?? 2
                    label += Number(context.parsed.y).toFixed(volumeDecimals)
                  }
                }
                return label
              },
            },
          },
        },
      },
    })

    // Cleanup function to destroy the chart when component unmounts
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }
    }
  }, [data, colorMode])

  return (
    <Box position="relative" h="30vh">
      <canvas ref={chartRef} />
    </Box>
  )
}

export default AuctionsChart
