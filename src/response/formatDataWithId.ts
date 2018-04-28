import { ResourceConfig } from '../typings';

function formatDataWithId(
  data: any | any[],
  resourceConfig: ResourceConfig,
) : any | any[] {
  const isArray = Array.isArray(data);
  const dataAsArray = <any[]>(isArray ? data : [data]);

  const formattedData = dataAsArray.map((d) => {
    if (!d || typeof d !== 'object') {
      return d;
    }

    return {
      ...d,
      id: d[resourceConfig.primaryKey],
    };
  });

  return isArray ? formattedData : formattedData[0];
}

export default formatDataWithId;
