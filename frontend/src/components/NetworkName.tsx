import Image from 'next/image'
import React from 'react'

const NetworkName = () => {
  return (
    <div>
        <Image src='./osmosis-logo.png' width={32} height={32} alt="Osmosis" />
        <h2>Osmosis</h2>
    </div>
  )
}

export default NetworkName