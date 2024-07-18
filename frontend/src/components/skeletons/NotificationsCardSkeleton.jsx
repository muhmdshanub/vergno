import React from 'react'
import { Skeleton, Card } from '@mui/material'
const NotificationsCardSkeleton = () => {
  return (
    <Card sx={{display:"flex",  alignItems:"center", justifyItems:"space-between", justifyContent:"space-between"}}>
    
          <Skeleton variant="circular" width={80} height={80} sx={{ marginBottom: 2 }} />
          <div style={{width:'70%'}}>
            <Skeleton variant="text" width="100%"  />
            <Skeleton variant="text" width="100%"  />
          </div>
          
          <Skeleton variant="rectangular" width="10%" height={40} />

  </Card>
  )
}

export default NotificationsCardSkeleton