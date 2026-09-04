using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using System.Threading;
using dosier_infrastructure.data.models;

namespace dosier_api.Controllers
{
    public class TitleBlockProvider : IDocumentBlockProvider
    {
        public string BlockType => "title";
        public BlockBehavior Behavior => BlockBehavior.StaticLayout;

        public void PopulateSchema(
            JsonElement block, 
            Dictionary<string, object> schemaDict, 
            List<string> listsList,
            List<object> richTextFields,
            ref int premiumFieldsCount,
            string templateCode)
        {
        }

        public Task MapToUiSectionAsync(
            JsonElement block, 
            string title, 
            List<UiSectionDto> sectionsList,
            DosierContext dbContext,
            string templateCode,
            CancellationToken ct)
        {
            return Task.CompletedTask;
        }
    }
}
