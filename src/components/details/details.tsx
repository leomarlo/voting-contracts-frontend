import { DetailsHandling } from "../../types/components"

const closeDetails = (event: any, detailsHandling: DetailsHandling) => {
  detailsHandling.focusOnDetailsSetter(false)
  detailsHandling.detailsSetter(<></>)
}


export {
  closeDetails
}