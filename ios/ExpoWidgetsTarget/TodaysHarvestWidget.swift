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

  private func sanitizeEmoji(_ value: String) -> String {
    let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
    if trimmed.isEmpty || trimmed.contains("\u{FFFD}") {
      return "🥕"
    }
    return trimmed
  }

  private var emojis: [String] {
    guard let props = entry.props else {
      return ["🍎", "🍐", "🍊"]
    }

    if let values = props["emojis"] as? [String], !values.isEmpty {
      return Array(values.prefix(8).map(sanitizeEmoji))
    }

    if let values = props["emojis"] as? [Any] {
      let normalized = values
        .compactMap { value -> String? in
          if let text = value as? String {
            return text
          }
          return nil
        }
        .filter { !$0.isEmpty }
      if !normalized.isEmpty {
        return Array(normalized.prefix(8).map(sanitizeEmoji))
      }
    }

    return ["🍎", "🍐", "🍊"]
  }

  private var displayedEmojis: [String] {
    switch family {
    case .systemSmall:
      return Array(emojis.prefix(4))
    default:
      return Array(emojis.prefix(8))
    }
  }

  private var columnCount: Int {
    switch family {
    case .systemSmall:
      return 2
    default:
      return 4
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
        "iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAMAAABiM0N1AAAAwFBMVEVHcEz/zE3/zE13slVzrVF3slX/zE3/zE13slX/zE13slV0rlL/zE3/zE13slV3slVckTv/zE3/zE3/zE3/zE13slX/zE13slWCslH/zE3/zE13slX/zE1ckTtckTtckTtckTtckTtckTtckTt3slXixk93slWSpUFckTtckTt3slX/zE13slWHoUBckTvcxk+Rt1TQvkr3yk67v1Htx0yDtVSjq0N1mj24skWqvFKzvVKur0SculNekz1yrFDEwVH3nz0BAAAAK3RSTlMA74CfEO9Qv4AQ3zDfYM9gv89AnyBAr1AgMI+/cECv6iDPcIiP33DvUJ+vLgM3mQAAAhlJREFUeF6t1Gl3ojAUx+F/AoKIoqJ1q6PttLPeuNtt1u//rUY8aQ7NUAQuz0te/A73koD6uC5q0VSq5YzBp84azhU/pLW67NFMyprQ/XCCwtyx01La9QRnNx/vesu1tuzdfQ1fny8WyBM6Db2rbpL+tv5f7+Q26SKf29QpBzfLdY5bXOLqbUW9dZ4iSwsjlfjzOxVYrR5/nq1WT0lngULu06Wnx92R3tg9f5mgmO5rafWsI7ZRJ8AlYyeZbXvYbI6UQ8yGyNPVp+lAlw3eT00ipT3s6TIhkS1sKGNHRfSnlzrqhYqZZ8yV7qgtFTQIYInUG1RU3yo1lRWqWHIbdqhiqamqh8hPvxAnRLPU9WKFyIP2XVkeqBQR6JCy/aJyRjgL2SGKkRgr24FK8vXHt22orDg7tKey/MzQlsqbZoX+UnkDAFfKcqTyREboharwAHC/mZktYpxGow3A4WzIGFq3/wdV1AEm6Yu/p4okgBZz0+ZwO4zBjD5SS9oSQ+qP1PjEDEGHupIVMtt2EHND10mn5QKijtAVgFENO7rHiccPRS4Sgjua7kDyQuFn3UEgGCGN+UptKxS0GZfW4Hy4GWyjyj+2eoYbwoYpd9dGh7EidilGpjljMt50EvWURIB3eYJzrNOm/ZpCCAZUGPJ57ZpCCKRghozhQHCOUVow75e4+vmGcz/rNXzpxbEnpfRQwtSTM18byVMCln99wGD1JcxbUwAAAABJRU5ErkJggg==",
      "🥕":
        "iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAMAAABiM0N1AAAAwFBMVEVHcEx3slX0kAz0kAz0kAz0kAz0kAx3slXxjQv0kAx3slXzjwv0kAx3slX0kAz0kAx3slV3slX0kAz0kAx3slV3slX0kAx3slV3slV3slXWdQN3slV3slXbeQTigAd3slX0kAzefAXYdwPWdQPZdwTWdQPWdQPcegXWdQPWdQPxjgvblxv0kAzWdQPZdwTyjgt3slXffAXuiwrsiAnphgnlggfcegXhfwbAnirnhAjXmB3skhGyojOHrkyjpjt/sFAgKBoRAAAALHRSTlMAIIDvn8+/7xAwYHBgcEAgv6/fj0AwUN8Qz+9Qis+fn68gcDCvv4BQj2Cv71oUsNgAAAKOSURBVHhezZXXltowEIaFbcDA0ntZYFvqSG703STv/1YxVgwey+xISc5Jvjtd+DtTmB/272iuhn/Fs/D9aun6nMwXnao/nhh7Bn7MKn3Nu75kYCzq+GdkSfWxnzIxLyihGT+GU/9ClZmykqJuXI5UpG9DJmkFyCMrNKKZfok8cmZGTP1COqaekl9M3byzQsbMlG6xaG4kGfUrPTid3r790YTajg0pB6RCl0fhOpDl9bs0GJ9Zw4Ych0w92ht7eBEe3DZpez7OON+Cwltm1gudoPvAz4SggObUoVTukifsQOH1h8Hm3LK3k6aC5g76518rA6Sm6GZJdEU1G+BiEt57U5oOCU9iChJTcLu3cZ1RHsk2Me0hx0lqugNGelLCpL1jgWjaLDHKgziK2LQBxNdubCFoK9flbUXeZDEStwwFRPsAre6OFkkPhUt6lqDDmvR85hFoMKI8T5wLoOmRg57lbzTc/FZBL8plRbzAVKE8j1y9LKGa7DbhqXmC8/w97NVDa9C/oFDwfLqG5xI9o8b6AKlpl/kyOL8z5p5LNQaZKAtwSVxcBmXXNE/D2+Zzei/VnuaRWZASCY5i49cKRKRcPZUd3habIs7TohxGUcEBtEemWCxZkp6WkmXHHb+ubic9z4ykB+8id3lPh1ADgDJpeVwbSFPwTHuYBSRoX3RB4Yb20AWp6YP/NIwmJPgRVOwR08FS0wdTrjEtbFDSB+G4ep47kBSnD9g4D+n4wOlj0BbOs1vp02faOCDB6SOL6rVUAT1qNX36csrmo8bpc/8kBeadofSZPTIz7OLM+ER0RSaj5MsDo6ETrdJi5jiERpsKYBxCoyey+21aQIvWRHjpnf66QRRDmyzLarTYf8NPfLFuinkGRIcAAAAASUVORK5CYII=",
      "🍅":
        "iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAMAAABiM0N1AAAAmVBMVEVHcEzdLkTdLkTdLkTdLkTdLkTdLkTdLkTdLkTdLkTdLkTdLkR3slXdLkTdLkTdLkR3slV3slV3slV3slV3slXdLkR3slV3slV3slV3slV3slV3slV3slV3slV3slXKRkfQP0aZhk/dLkR3slXET0iRkVHKR0fXNkW9V0mXiVCqcE2KmVJ9qlSEolPQP0awaEudgU+keE63YEpdEp9uAAAAInRSTlMAgJ9wv2AgEO/fr1Dfz0AwEDDvzyCPcL9An69ggI9Qr4C/VFQTQQAAAiVJREFUeF7t11lzmzAUBeDDYnYD3rc4be/F+5b0//+4RthFExswWHrpTL8XvZ05usgy4N5w/g49elFUGjVEW+mAJ737lGU0wytJ/PYtZsY8wwt6feaB3Mp7nzlK8YoxM/d7uJrylyleE4mkBYS0z8wD0XM5YCGatEhdcNFJtOM3pHMW5uMe2kg5NwYwyYPSvM1yiLYGnIvG00isk0nRsKUZl4rmixQtJNaPI1c4/vqZoJHQ9IhovbsP2O2zM33J9lt/5OAJ1/DparP/Vuq0ocKaiOy4Psajm1uMtKI7QXWrsIj5feIHZ7rjGRV1zKL6inOHlah1vIVe6IHtluV0i12JkN0lE4P6YObtZiuWHT3yk+qczYFPnxn9lR35RETnHR+ohJdU5ZxXl9swZPBarB9MTZICeiCTLiSsqJTnQoJFNdZ7ErZrKtWF5HhUZ3ttllE5AwWTam3kUsopCpEaWxZSFCPnkioTuQ4pc+UZUmNBIElp3DFp4MpTrf7cRqSBAcAmDQIAXdI0bdLB0xVE/2DQ/yBP18m25XWkfkcapIEFICQNEgCuplkDXS0j0nNFhhAcUuUDevZmQM8/pHxF8pULyUrqhdQrdSDFir9XKVDbmOT6ai9ZUqI6IMUnNwK0JJmAliQL0JHkdeq+/JrzE1Rzus3H7KKW0bBOjGccm57yLDQRP4nyLRcNOaPqqQchWglNv6SL2XHRnhMagX2L8+3ACB1U+wNBw+F0vu9RIQAAAABJRU5ErkJggg==",
      "🍆":
        "iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAMAAABiM0N1AAAAgVBMVEVHcEx0Tqp3slV0Tqp0Tqp0Tqp0Tqp0Tqp0Tqp0Tqp0Tqp0Tqp0Tqp0Tqp0Tqp3slV0Tqp0Tqp3slV3slV3slV3slV3slV3slV3slV3slV3slV3slV3slV3slV3slV0Tqp3slV1Z5V1YZp1eoV0VKV3rFp2gIB2n2V1bY91dIp2mWrESVrzAAAAH3RSTlMAUL+vYBAw78+fv0DfcCBggI/vEIBAryDfn48wz3BQtsaD9wAAAYxJREFUeF6t1QlygzAMBVCxGBtMgECapZtEti73P2BpO6nLDB4i5HeAP9K3wfCteyaKIYCaBjXIbWiwCTXRFuQeiMKU1IUKAhq0HcjFNNjHcdxua+FETryTnZrTLh7qqaWxR0FDY4elh3/zdsQfRi28jjdXREHSyyhIkLQhuhzxRIMT/smB7ZXoAxH7C9ERnWZJR2ccnPse/4uAaUefOEVXwLS/4hR+4Yd3nMIvvO7RIwWeEj24hSfoozPgWGGgpAr9dCQsyUmFuzlr4W5OobjnJi8qwhmJktXt6Ds7T3GWscKRnCIVjuSUTSUcyTGNVcKRHLPOwK9ADuPvyyJPGTGvN/+WVhqZdMb7CfD/MSZUUoZ809s1yKZVqOWS6eU0stlQJ1ewriV/JMWvKYdQNSnfS8AVMd9L/hOaC85NlKQhVBL4JYIgwUwQKglCJUGoJJixEt4jJxXdbP4XnMG8ygg3c9bCgZxoZr0V3EvlzP+jnzXMp9YvnY4qKmCzucYxnWewjG2KEn+ZpLHgwBcpyBWSGBU1bgAAAABJRU5ErkJggg==",
      "🥑":
        "iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAMAAABiM0N1AAAAwFBMVEVHcEw+ch0+ch0+ch0+ch0+ch0+ch0+ch0+ch0+ch0+ch0+ch0+ch0+ch0+ch0+ch0+ch3G5bOm04i13J1FeCSZx3vE5K+gzYF/r2BYijip1YxmIRO+4ah+Ujuu2JO736SMu23A4qtLfiqWg2Nyo1PA2amx2pa43aC0wJV5qVlsnExllkWs1pBShDGEXkVyOid4RjFfkD55LyJ8MiV2LR9xKhynpX9sLR2cj22TwXSKa0+GtWe6zZ9sJRiQd1mutIvNMP9OAAAAEHRSTlMAvzAg79+fEECAYI/PcK9QSA3USAAAA7pJREFUeF7tmOeS4jgURhvaBpM/OZJzDp3zzOy+/1ttS7J8y1ybhqX2354HOPXdpDLc/Jf8z+2VgrJTKRUsaOqlavnfSIqNpo0jrMqlSVolIzl0tnPJ7gBJoXyBpdqMHdv2p0sEcx9A7VxNS1um21+Re0wgU53V99uapaJsdBJuAlD6WVMtqCzzwM1lB+CHLpUrNgB/N3ZP8QtA47TGkmHakXuaCEDzJ00nHWY/9BT7lAmAdVqzC8jRXa76IiFcpkUo5rTYTmu6XiwhlqmxwckceAHAY0CWieCEXSMaI6fbFQCHpDdLnYUzNKI5AFR4dwqAvzFhVqHIwzOix0yRYwGduKr9SHB4Ij9LVAUQxxn2xUn2tI9cVAH8T13USKxng0GvNxjM1lmekC6Ei0rAIdCDWnzc9xLuP7hoRHvNRNITqarCN63588eo3liLaGbHe1Q1ntXiS1lenr95il1/pT19E8g3Iubp9hcP0vP6HBObvjIDtaGhp61owQ+kZ6I9Ko6mp5mdCATawzowVh4xUHU9E69a9MBnbzqEeiKqARvt+VABnrioR57VUSB6ax2gI6OOxOJdiZ65aMAPdgcF3WzZ1g3yhJj14soINrch3X2MQxs9l4WFQrwz0VNPs2aFTWEwgSxMI1WY+LunYYGosokbs4WhQIHaMpDQldEWkYcChV1WGBpJIN/VgcRdj0xmsdNbNOSFoZjs9FyKQiHUEhnVy8ur0dASLek9S7BvNHVAjmwpjIhzv6Cj12xA1LTnFjioW80Xva+PPWOAVdaIK+sL6lGOZ2IaHfjglTX1lbkToabGefh97IkOpKG1toFIioTkjXvuFuSJMZ70EwLANUMzm028fwjm2YGgg701or4SfaU9X4s8D7szx4hWSrR4IMv97Dc9ZdxD55EWLYVmPbsbfDN7IwvNnXngMJFuEhEKwuMeCmQAMKZIWYTDXA+clGjuKkbZnlHXZfvDAulTm7r5pj7F+dQHz66DNhvt2OSFXJPQ9qHg55rcGvwo64to4nVJE23BsFPf10VA3b9h73mjft/zhtJCZVF7eKfp2IBHmYnB4/DCiBokhyDfM56CgzoVRtcG+nLkmg6ysPi3dQGS7J8LUXuKbKo3DAcJj+3AJcab7DD0jcYjEX6no35ndvic+CvEunQJ5OFUrvQQhes99MXGOX9eRNHCmVh0GFeZmrTP11RntbiAU/tRU6E4J3Hsk5rSBf/0VHNVNqW54I8QHsa5uZxyq1YHYTcbxWv++HKcVqXlOOc6/gEMnBeOxHje2wAAAABJRU5ErkJggg=="
    ]
  }

  private func emojiImage(for emoji: String) -> UIImage? {
    guard let base64 = emojiImageBase64[emoji],
          let data = Data(base64Encoded: base64) else {
      return nil
    }
    return UIImage(data: data)
  }

  private func renderedEmojiImage(for emoji: String, size: CGFloat) -> UIImage? {
    let canvas = CGSize(width: size, height: size)
    let renderer = UIGraphicsImageRenderer(size: canvas)
    let font = UIFont(name: "AppleColorEmoji", size: size * 0.82) ?? UIFont.systemFont(ofSize: size * 0.82)
    let attributes: [NSAttributedString.Key: Any] = [
      .font: font
    ]
    let text = emoji as NSString
    let textSize = text.size(withAttributes: attributes)
    let origin = CGPoint(
      x: (canvas.width - textSize.width) / 2,
      y: (canvas.height - textSize.height) / 2
    )

    return renderer.image { _ in
      text.draw(at: origin, withAttributes: attributes)
    }
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
              } else if let image = renderedEmojiImage(for: emoji, size: iconSize) {
                Image(uiImage: image)
                  .resizable()
                  .scaledToFit()
              } else {
                Text("🥕")
                  .font(.system(size: iconSize * 0.72))
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
