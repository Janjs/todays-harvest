import WidgetKit
import SwiftUI
import UIKit
internal import ExpoWidgets

struct TodaysHarvestWidget: Widget {
  let name: String = "TodaysHarvestWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: name, provider: WidgetsTimelineProvider(name: name)) { entry in
      TodaysHarvestWidgetEntryView(entry: entry)
    }
    .configurationDisplayName("Today's Harvest")
    .description("Fruit currently in season for your location.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}

private struct TodaysHarvestWidgetEntryView: View {
  @Environment(\.widgetFamily) private var family
  let entry: WidgetsTimelineEntry

  private var emojis: [String] {
    guard let props = entry.props,
          let values = props["emojis"] as? [String],
          !values.isEmpty else {
      return ["🍎", "🍐", "🍊"]
    }
    return Array(values.prefix(6))
  }

  private var displayedEmojis: [String] {
    switch family {
    case .systemSmall:
      return Array(emojis.prefix(4))
    default:
      return Array(emojis.prefix(6))
    }
  }

  private var columnCount: Int {
    switch family {
    case .systemSmall:
      return 2
    default:
      return 3
    }
  }

  private var emojiImageBase64: [String: String] {
    [
      "🍎":
        "iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAMAAABiM0N1AAAAwFBMVEVHcEzdLkTdLkTdLkTdLkTdLkTdLkTdLkTdLkTdLkTdLkTdLkTdLkR3slV3slV3slXdLkR3slVmIRNmIRN3slV3slV3slV3slVmIRNmIRPdLkRmIRN3slVmIRNmIRNmJhV3slVmIRN3slV3slV3slVmIRN3slVmIROzZUtmIRNmIROZJyhmIRNmIRNqRSR3slVvajTdLkRmIRN3slWiKCyndE3XMUORkVGKmVLOLD6dgU+EolPET0i/KzjHLDttYDC8+NNhAAAAMXRSTlMA38+PMIBA758QUL8gn+/fcBCfj4Agz1CAEK9AYL8gz49QMEBw768wv3DfcGCvgL8gmwEKpgAAAcxJREFUeF7t18d24yAUgOELEgJkFfceO8n0Pki2k+nv/1YjvIiiA2pcZ5OTf+nFd8xFMga6NsmyJeCDZVYE+G6yy0CrN9qZ4KGxdsZ4Z6Od/QoPXWloA7rRIp7n59K3r297OruHhc3iJH9cuh31gSYa2mkmN0oXPaCPhfMFYJvktuLOzrus6PMozu1dd4Y+aOj73M6kr/o9RHu7k0xbgUhWNv+ffTyNe+azAVHnqAg1lxV9nX5LjG8za1AkI6rSmgUa+sTW6vT7eLy7z8/9+vleQkOMKzMN/VFGnNUviipLPzT0V1mifo3Dla2ThpQ17jc4ZocsO6jukqTKIWqO3FNOecYDqByLoJpwhQRU464Qrzqhci60jRo/7oE7NLCNCD8khegZQ/JlRq1d+oHEvyJPAzF3iFWgoTs0rECBOxRUIIl8Q8qIq0Oe6hQZ4mZd5rtCxulPUCPCD0kYUIg5HvEnEgczgVgZfm0hWCKIPcP+lDArJBEvLHLcAuxFiP+PqK8koK6I93G4hNoYcsvKCOIZcj0EAmjMQy6sjHZzKLQlOWbH2u9t5j0NLZlOz7uteZdtT3olQLygyCOl40noXiC4VqgIyk+oVrgI7MB/wL5aEEzzoaMAAAAASUVORK5CYII=",
      "🍐":
        "iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAMAAABiM0N1AAAAbFBMVEVHcEym04im04im04im04im04im04im04im04im04im04im04hmIROm04im04hmIROm04hmIRNmIROm04hmIRNmIRNmIRNmIRNmIRNmIRNxPydmIRNmIRNmIROm04hmIROasnJqLBqCb0ZyQilYeZ5rAAAAHnRSTlMAn89QvyBg7xCAj6+/MECPcEAg3zDPYBDf77+AcJ9i5LG4AAABeklEQVR4Xq3Xa3LbMAwE4CVFiqReke20ebVA0t7/jpWnf5qUtAXNfgfYAUHuyAbX06TPjyB4UNUJBJNuWBPpiRD0XTcPhKCzbp5B8E03jHt7081P1tn0ifEAWOs+6dWZte6JNtIP1pb0BGDuSyndjIPOL7p5eewu8lca+3y8J/oh/0guHq6uvssnh6Jev050lVZYOfmlv9/lPyHCpJeW1MHCS1sPA7mlsIJkzKQgSUPEPknu8euMHYLskEJZMm4rspcfOtzQiUFyM5rEJjSjRjEqzY5Y+YyaLKykUcxC8944e0piF1ExiJ1DRRS7lOt9s+soT2kzsNYdUOPEzIN1NrDuDVWJtCMEVtBAun4UsepRtYhVJAV51EXSyYAj5We0raAlkAbCaB+I8JAumfQTYEFbNLajzR/8zh6vbZoBMM7W4Q5n6AZhJIf7CikHCKQcZG9rhj3J/m8pj9IUIizWJFWph1F2tbqXDLu8XuSTscdRcXUhySaEsuCGPxxoEFUXOMzaAAAAAElFTkSuQmCC",
      "🍊":
        "iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAMAAABiM0N1AAAAwFBMVEVHcEz0kAz0kAz0kAz0kAz0kAz0kAz0kAz0kAz0kAxckTv0kAz0kAz0kAz0kAxckTtmIRNckTtckTtmIRNfby70kAxmIRNckTtmIRNckTtmIRNckTtckTtckTtmIRNmIRNckTtmIRNmIRNckTtmIRNmIRNmIROHOxH0kAxmIRPRdA7MkBjZew1ckTufkSZfdTGCkS95jzHrjQ1vKBO2Xw/hkBK7kB6bSxBmkThvkTXYkBV4LxJjRCBhWSeokSTIbQ48N49hAAAAKHRSTlMAgN/vvyAwz2BQv3AQr0Aw76+AgBCPn+9QWyBAIN/fr88wQJ+PcL/P3v8U+gAAAdBJREFUeF7d2ImOm0AMBmBDYAZCyCbZbjbHXr3/Ieceva/3f6smDRKi45ABU2nV7wF+gW1mLOiYq+lo2N0bjkbzK2pq2l2VdUdTqm9+vbLdUV0vXq8Yl7Vf7+yOzTmrnXP5L3M+f8WOTr2451qf66M5OZ2ExDo35ub27Us6GHI59x9QksbEMAc348m+71zO+gF/8yM2KDd4M2Me6MsCnEAxr1awYz7iGM+q76vzdya3KddmvUAFzVV9Mh6Yve8/Npv77Xa7/rlY4JROnziTW3Pw+AvZEk4iYs3GgzzKGFkSzd6bXAZRUozs2+GZ4Iqtk+oAD2bvCa46XO80gMzsfII7TZYL7CyNeWSfx30yFf5YZqhJUVmAhgIqiWBrNAM+GvPLIyQQyypUSIucECLFVCYQSUpDLaAp14NQz+qZsG8ehLyi+TKpVWthtSH2XIPCZxT0Hxe77YGUfyJtf7TyY6Tlg01+1LZ9+Muvo7YvSPmV3f4SIV9r2l+0SKEhZS+jjXhk0WhA8wt7QbKwUx+19YkVCTtfiAQ5gqSIKsTOFe/0qZLScKIVnXLRYA55KsAJgSI3kY8KfkTu4gA8pDHVEyYaFp2E1EAv9gKNnA4qfkT9BsA2Q15J5oDlAAAAAElFTkSuQmCC",
      "🍋":
        "iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAMAAABiM0N1AAAAwFBMVEVHcEz/zE3/zE13slVzrVF3slX/zE3/zE13slX/zE13slV0rlL/zE3/zE13slV3slVckTv/zE3/zE3/zE3/zE13slX/zE13slWCslH/zE3/zE13slX/zE1ckTtckTtckTtckTtckTtckTtckTt3slXixk93slWSpUFckTtckTt3slX/zE13slWHoUBckTvcxk+Rt1TQvkr3yk67v1Htx0yDtVSjq0N1mj24skWqvFKzvVKur0SculNekz1yrFDEwVH3nz0BAAAAK3RSTlMA74CfEO9Qv4AQ3zDfYM9gv89AnyBAr1AgMI+/cECv6iDPcIiP33DvUJ+vLgM3mQAAAhlJREFUeF6t1Gl3ojAUx+F/AoKIoqJ1q6PttLPeuNtt1u//rUY8aQ7NUAQuz0te/A73koD6uC5q0VSq5YzBp84azhU/pLW67NFMyprQ/XCCwtyx01La9QRnNx/vesu1tuzdfQ1fny8WyBM6Db2rbpL+tv5f7+Q26SKf29QpBzfLdY5bXOLqbUW9dZ4iSwsjlfjzOxVYrR5/nq1WT0lngULu06Wnx92R3tg9f5mgmO5rafWsI7ZRJ8AlYyeZbXvYbI6UQ8yGyNPVp+lAlw3eT00ipT3s6TIhkS1sKGNHRfSnlzrqhYqZZ8yV7qgtFTQIYInUG1RU3yo1lRWqWHIbdqhiqamqh8hPvxAnRLPU9WKFyIP2XVkeqBQR6JCy/aJyRjgL2SGKkRgr24FK8vXHt22orDg7tKey/MzQlsqbZoX+UnkDAFfKcqTyREboharwAHC/mZktYpxGow3A4WzIGFq3/wdV1AEm6Yu/p4okgBZz0+ZwO4zBjD5SS9oSQ+qP1PjEDEGHupIVMtt2EHND10mn5QKijtAVgFENO7rHiccPRS4Sgjua7kDyQuFn3UEgGCGN+UptKxS0GZfW4Hy4GWyjyj+2eoYbwoYpd9dGh7EidilGpjljMt50EvWURIB3eYJzrNOm/ZpCCAZUGPJ57ZpCCKRghozhQHCOUVow75e4+vmGcz/rNXzpxbEnpfRQwtSTM18byVMCln99wGD1JcxbUwAAAABJRU5ErkJggg=="
    ]
  }

  private func emojiImage(for emoji: String) -> UIImage? {
    guard let base64 = emojiImageBase64[emoji],
          let data = Data(base64Encoded: base64) else {
      return nil
    }
    return UIImage(data: data)
  }

  var body: some View {
    ZStack {
      Color.white

      GeometryReader { proxy in
        let rows = max(Int(ceil(Double(displayedEmojis.count) / Double(columnCount))), 1)
        let widgetWidth = proxy.size.width
        let widgetHeight = proxy.size.height
        let preferredGap = family == .systemSmall ? min(widgetWidth, widgetHeight) * 0.16 : min(widgetWidth, widgetHeight) * 0.12
        let maxGapForWidth = max((widgetWidth - CGFloat(columnCount) * 24) / CGFloat(columnCount + 1), 8)
        let maxGapForHeight = max((widgetHeight - CGFloat(rows) * 24) / CGFloat(rows + 1), 8)
        let gap = min(preferredGap, maxGapForWidth, maxGapForHeight)
        let iconSize = min(
          (widgetWidth - gap * CGFloat(columnCount + 1)) / CGFloat(columnCount),
          (widgetHeight - gap * CGFloat(rows + 1)) / CGFloat(rows)
        )
        let gridWidth = (iconSize * CGFloat(columnCount)) + (gap * CGFloat(columnCount - 1))
        let gridHeight = (iconSize * CGFloat(rows)) + (gap * CGFloat(max(rows - 1, 0)))
        let centeredColumns = Array(repeating: GridItem(.fixed(iconSize), spacing: gap), count: columnCount)

        LazyVGrid(columns: centeredColumns, spacing: gap) {
          ForEach(Array(displayedEmojis.enumerated()), id: \.offset) { _, emoji in
            Group {
              if let image = emojiImage(for: emoji) {
                Image(uiImage: image)
                  .resizable()
                  .scaledToFit()
              } else {
                Color.clear
              }
            }
            .frame(width: iconSize, height: iconSize)
          }
        }
        .frame(width: gridWidth, height: gridHeight, alignment: .center)
        .padding(gap)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
      }
    }
  }
}
